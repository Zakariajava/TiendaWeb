/**
 * payment-methods.js - Sistema unificado de gestión de métodos de pago
 * ----------------------------------------------------------------------
 * Este sistema centralizado proporciona funcionalidades para:
 * - Cargar métodos de pago utilizados previamente por el usuario
 * - Mostrar los métodos en la interfaz de forma clara e intuitiva
 * - Permitir la selección, edición y preferencia de métodos de pago
 * - Mejorar la experiencia durante el checkout
 */

/**
 * Carga los métodos de pago del usuario desde sus favoritos
 * y los muestra en el contenedor especificado
 * 
 * @param {string} containerId - ID del contenedor donde mostrar los métodos
 * @param {Function} onSelectCallback - Función a ejecutar cuando se selecciona un método
 */
function loadUserPaymentMethods(containerId, onSelectCallback) {
  const container = document.getElementById(containerId);
  if (!container) {
      console.error('Contenedor no encontrado:', containerId);
      return;
  }
  
  // Mostrar indicador de carga
  container.innerHTML = `
    <div class="text-center py-3" id="payment-methods-loader">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="sr-only">${getI18nMessage('general.loading', 'Cargando...')}</span>
      </div>
      <p class="my-2 text-muted">${getI18nMessage('account.loadingPayments', 'Cargando métodos de pago...')}</p>
    </div>
  `;
  
  // Configurar un timeout para casos donde la respuesta nunca llega o tarda demasiado
  const timeoutId = setTimeout(() => {
    console.log('Timeout alcanzado al cargar métodos de pago');
    handleEmptyMethods();
  }, 5000); // Reducir a 5 segundos
  
  // Función para manejar el caso de métodos vacíos o timeout
  function handleEmptyMethods() {
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Mostrar mensaje de "sin métodos guardados"
    container.innerHTML = `
      <div class="alert alert-info mb-3">
        <i class="fas fa-info-circle"></i> 
        ${getI18nMessage('account.noSavedPaymentMethods', 'No tienes métodos de pago guardados')}
      </div>
    `;
    
    // Añadir opción para nuevo método
    const newMethodCard = createNewPaymentMethodCard(onSelectCallback);
    container.appendChild(newMethodCard);
    
    // IMPORTANTE: Seleccionar automáticamente el nuevo método y llamar al callback
    if (typeof onSelectCallback === 'function') {
      onSelectCallback(null);
      newMethodCard.classList.add('selected');
    }
  }
  
  // Hacer petición al servidor
  fetch('../metodos-pago-servlet?tipo=favoritos')
    .then(response => {
      clearTimeout(timeoutId); // Cancelar timeout
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(methods => {
      // Limpiar contenedor
      container.innerHTML = '';
      
      // Si no hay métodos guardados, mostrar mensaje y opción para nuevo
      if (!methods || methods.length === 0) {
        handleEmptyMethods();
        return;
      } else {
        // Ordenar los métodos: primero los favoritos predeterminados, luego otros
        methods.sort((a, b) => {
          if (a.predeterminado && !b.predeterminado) return -1;
          if (!a.predeterminado && b.predeterminado) return 1;
          return 0;
        });
        
        // Crear un elemento para cada método de pago
        methods.forEach(method => {
          try {
            const methodCard = document.createElement('div');
            methodCard.className = 'payment-method-card';
            methodCard.dataset.id = method.id;
            methodCard.dataset.type = method.metodoPago;
            
            // Si es predeterminado, añadir clase especial
            if (method.predeterminado) {
              methodCard.classList.add('default');
            }
            
            // Determinar icono según tipo de pago
            let icon, label;
            switch(method.metodoPago) {
              case 'tarjeta':
                icon = 'fa-credit-card';
                label = getI18nMessage('checkout.creditCard') || 'Tarjeta de crédito';
                break;
              case 'transferencia':
                icon = 'fa-university';
                label = getI18nMessage('checkout.bankTransfer') || 'Transferencia bancaria';
                break;
              case 'bizum':
                icon = 'fa-mobile-alt';
                label = 'Bizum';
                break;
              case 'contrareembolso':
                icon = 'fa-money-bill-wave';
                label = getI18nMessage('checkout.cash') || 'Contra reembolso';
                break;
              default:
                icon = 'fa-credit-card';
                label = method.metodoPago;
            }
            
            // Obtener los últimos 4 dígitos del hash para mostrar (si existe)
            let lastDigits = '';
            if (method.numeroTarjetaHashed && method.numeroTarjetaHashed.length > 4) {
              lastDigits = method.numeroTarjetaHashed.substring(method.numeroTarjetaHashed.length - 4);
            }
            
            // Construir contenido de la tarjeta
            const badgeHtml = method.predeterminado ? 
              `<span class="badge badge-primary ml-2">
                ${getI18nMessage('checkout.default') || 'Predeterminado'}
              </span>` : '';
            
            methodCard.innerHTML = `
              <div class="d-flex align-items-center payment-method-content">
                <div class="payment-method-icon mr-3">
                  <i class="fas ${icon} fa-lg"></i>
                </div>
                <div class="payment-method-details">
                  <div class="payment-method-name font-weight-bold">${label} ${badgeHtml}</div>
                  ${lastDigits ? 
                    `<div class="payment-method-info text-muted small">
                      ${getI18nMessage('checkout.endingIn') || 'Termina en'} ${lastDigits}
                    </div>` : 
                    ''}
                </div>
              </div>
            `;
            
            // Añadir evento de clic si hay callback
            if (typeof onSelectCallback === 'function') {
              methodCard.addEventListener('click', () => {
                // Deseleccionar todos los métodos
                container.querySelectorAll('.payment-method-card').forEach(el => {
                  el.classList.remove('selected');
                });
                
                // Seleccionar este método
                methodCard.classList.add('selected');
                
                // Llamar al callback con los datos del método
                onSelectCallback(method);
              });
            }
            
            container.appendChild(methodCard);
          } catch (error) {
            console.error('Error procesando método de pago:', error, method);
          }
        });
      }
      
      // Añadir opción para nuevo método de pago
      const newMethodCard = createNewPaymentMethodCard(onSelectCallback);
      container.appendChild(newMethodCard);
      
      // Si solo tenemos el nuevo método (no había guardados),
      // seleccionarlo automáticamente para mostrar el formulario
      if (!methods || methods.length === 0) {
        if (typeof onSelectCallback === 'function') {
          onSelectCallback(null);
          // Seleccionar visualmente
          newMethodCard.classList.add('selected');
        }
      }
    })
    .catch(error => {
      console.error('Error cargando métodos de pago:', error);
      clearTimeout(timeoutId); // Limpiar timeout en caso de error
      
      // Mensaje de error más detallado
      container.innerHTML = `
        <div class="alert alert-danger mb-3">
          <i class="fas fa-exclamation-circle"></i> 
          ${getI18nMessage('error.loadingPaymentMethods') || 'Error al cargar métodos de pago'}
          <small class="d-block mt-1">${error.message}</small>
        </div>
      `;
      
      // Añadir opción para nuevo método incluso en caso de error
      const newMethodCard = createNewPaymentMethodCard(onSelectCallback);
      container.appendChild(newMethodCard);
      
      // En caso de error, llamar al callback con null
      if (typeof onSelectCallback === 'function') {
        onSelectCallback(null);
        // Seleccionar visualmente
        newMethodCard.classList.add('selected');
      }
    });
}

// Función auxiliar para crear tarjeta de nuevo método de pago
function createNewPaymentMethodCard(onSelectCallback) {
  const newMethodCard = document.createElement('div');
  newMethodCard.className = 'payment-method-card payment-method-new';
  newMethodCard.innerHTML = `
    <div class="d-flex align-items-center payment-method-content">
      <div class="payment-method-icon mr-3">
        <i class="fas fa-plus-circle fa-lg"></i>
      </div>
      <div class="payment-method-details">
        <div class="payment-method-name font-weight-bold">
          ${getI18nMessage('checkout.useNewPayment') || 'Usar nuevo método de pago'}
        </div>
      </div>
    </div>
  `;
  
  // Evento para nuevo método
  if (typeof onSelectCallback === 'function') {
    newMethodCard.addEventListener('click', () => {
      // Deseleccionar todos los métodos
      document.querySelectorAll('.payment-method-card').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Seleccionar este método
      newMethodCard.classList.add('selected');
      
      // Llamar al callback con null para indicar nuevo método
      onSelectCallback(null);
    });
  }
  
  return newMethodCard;
}


/**
 * Establece un método de pago como predeterminado
 * 
 * @param {number} methodId - ID del método de pago
 * @param {function} callback - Función a ejecutar después (opcional)
 */
function setDefaultPaymentMethod(methodId, callback) {
  // Verificar parámetro
  if (!methodId) {
      console.error('ID de método no proporcionado');
      return;
  }
  
  // Enviar petición al servidor
  fetch('../metodos-pago-servlet', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          operacion: 'establecer_predeterminado',
          id: methodId
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      if (data.success) {
          // Mostrar notificación de éxito
          Notify.success(getI18nMessage('payment.defaultSet') || 'Método establecido como predeterminado');
          
          // Ejecutar callback si existe
          if (typeof callback === 'function') {
              callback(true);
          }
      } else {
          throw new Error(data.error || 'Error desconocido');
      }
  })
  .catch(error => {
      console.error('Error estableciendo predeterminado:', error);
      Notify.error(getI18nMessage('error.generalError') || 'Error al procesar la solicitud');
      
      // Ejecutar callback con error si existe
      if (typeof callback === 'function') {
          callback(false);
      }
  });
}


/**
* Elimina un método de pago favorito
* 
* @param {number} methodId - ID del método de pago
* @param {function} callback - Función a ejecutar después (opcional)
*/
function deletePaymentMethod(methodId, callback) {
  // Verificar parámetro
  if (!methodId) {
      console.error('ID de método no proporcionado');
      return;
  }
  
  // Enviar petición al servidor
  fetch('../metodos-pago-servlet', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          operacion: 'eliminar',
          id: methodId
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      if (data.success) {
          // Mostrar notificación de éxito
          Notify.success(getI18nMessage('payment.deleted') || 'Método de pago eliminado');
          
          // Ejecutar callback si existe
          if (typeof callback === 'function') {
              callback(true);
          }
      } else {
          throw new Error(data.error || 'Error desconocido');
      }
  })
  .catch(error => {
      console.error('Error eliminando método:', error);
      Notify.error(getI18nMessage('error.generalError') || 'Error al procesar la solicitud');
      
      // Ejecutar callback con error si existe
      if (typeof callback === 'function') {
          callback(false);
      }
  });
}

  
/**
 * Inicializa el formulario de edición de método de pago
 * 
 * @param {object} method - Objeto con datos del método de pago (null para nuevo)
 * @param {string} formContainerId - ID del contenedor del formulario
 */
function initializePaymentMethodForm(method, formContainerId) {
  const formContainer = document.getElementById(formContainerId);
  if (!formContainer) {
    console.error('Contenedor del formulario no encontrado:', formContainerId);
    return;
  }
  
  // Determinar si es edición o nuevo método
  const isEditing = method !== null && method.id !== undefined;
  console.log(isEditing ? 'Modo edición' : 'Modo nuevo método', method);
  
  // Construir formulario
  formContainer.innerHTML = `
    <form id="payment-method-form" class="payment-method-form">
      <input type="hidden" id="payment-method-id" value="${isEditing ? method.id : ''}">
      
      <div class="form-group">
        <label for="payment-method-type">
          ${getI18nMessage('checkout.paymentMethod') || 'Método de pago'}
        </label>
        <select class="form-control" id="payment-method-type" required ${isEditing ? 'disabled' : ''}>
          <option value="tarjeta" ${isEditing && method.metodoPago === 'tarjeta' ? 'selected' : ''}>
            ${getI18nMessage('checkout.creditCard') || 'Tarjeta de crédito'}
          </option>
          <option value="transferencia" ${isEditing && method.metodoPago === 'transferencia' ? 'selected' : ''}>
            ${getI18nMessage('checkout.bankTransfer') || 'Transferencia bancaria'}
          </option>
          <option value="bizum" ${isEditing && method.metodoPago === 'bizum' ? 'selected' : ''}>
            Bizum
          </option>
          <option value="contrareembolso" ${isEditing && method.metodoPago === 'contrareembolso' ? 'selected' : ''}>
            ${getI18nMessage('checkout.cash') || 'Contra reembolso'}
          </option>
        </select>
      </div>
      
      <div id="card-fields" class="form-group" style="display: ${isEditing && method.metodoPago === 'tarjeta' || !isEditing ? 'block' : 'none'};">
        <label for="card-number">
          ${getI18nMessage('account.cardNumber') || 'Número de tarjeta'}
        </label>
        <div class="card-input-container">
          <div class="row">
            <div class="col-3">
              <input type="text" class="form-control card-input" id="card-number-1" 
                maxlength="4" placeholder="XXXX" pattern="[0-9]{4}">
            </div>
            <div class="col-3">
              <input type="text" class="form-control card-input" id="card-number-2" 
                maxlength="4" placeholder="XXXX" pattern="[0-9]{4}">
            </div>
            <div class="col-3">
              <input type="text" class="form-control card-input" id="card-number-3" 
                maxlength="4" placeholder="XXXX" pattern="[0-9]{4}">
            </div>
            <div class="col-3">
              <input type="text" class="form-control card-input" id="card-number-4" 
                maxlength="4" placeholder="XXXX" pattern="[0-9]{4}">
            </div>
          </div>
          <small class="text-muted form-text">
            ${getI18nMessage('account.cardNumberHelp') || 'Introduzca el número completo de su tarjeta.'}
          </small>
        </div>
      </div>
      
      <div class="form-check mt-3 mb-3" id="save-payment-checkbox-container" ${isEditing ? 'style="display:none"' : ''}>
        <input type="checkbox" class="form-check-input" id="save-payment-method" checked>
        <label class="form-check-label" for="save-payment-method">
          ${getI18nMessage('checkout.saveForFuture') || 'Guardar para futuras compras'}
        </label>
        <small class="form-text text-muted">
          ${getI18nMessage('checkout.saveForFutureHelp') || 'Esta opción guardará tu método de pago para facilitar futuras compras'}
        </small>
      </div>
      
      <div class="form-group mt-4">
        <button type="submit" class="btn btn-primary">
          ${isEditing ? getI18nMessage('general.save') || 'Guardar' : getI18nMessage('checkout.addPayment') || 'Añadir método de pago'}
        </button>
        <button type="button" class="btn btn-secondary ml-2" id="cancel-payment-edit">
          ${getI18nMessage('general.cancel') || 'Cancelar'}
        </button>
      </div>
    </form>
  `;
  
  // Referencia al formulario recién creado
  const form = document.getElementById('payment-method-form');
  if (!form) {
    console.error('El formulario no se pudo crear correctamente');
    return;
  }
  
  // Mostrar el formulario
  formContainer.style.display = 'block';
  
  // Referencias a elementos creados
  const methodTypeSelect = document.getElementById('payment-method-type');
  const cardFields = document.getElementById('card-fields');
  const saveCheckboxContainer = document.getElementById('save-payment-checkbox-container');
  const cancelButton = document.getElementById('cancel-payment-edit');
  
  // Event listeners
  
  // Mostrar/ocultar campos de tarjeta según método
  if (methodTypeSelect) {
    methodTypeSelect.addEventListener('change', () => {
      if (cardFields) {
        cardFields.style.display = methodTypeSelect.value === 'tarjeta' ? 'block' : 'none';
      }
    });
  }
  
  // Auto-focus al siguiente campo de tarjeta cuando se llena
  document.querySelectorAll('.card-input').forEach((input, index) => {
    input.addEventListener('input', function() {
      // Solo aceptar dígitos
      this.value = this.value.replace(/\D/g, '');
      
      if (this.value.length === this.maxLength) {
        const nextInput = document.getElementById(`card-number-${index + 2}`);
        if (nextInput) nextInput.focus();
      }
    });
    
    // Permitir retroceder con backspace cuando el campo está vacío
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && this.value === '') {
        const prevInput = document.getElementById(`card-number-${index}`);
        if (prevInput) prevInput.focus();
      }
    });
  });
  
  // Cancelar edición
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      formContainer.innerHTML = '';
      // Disparar evento personalizado para notificar cancelación
      const event = new CustomEvent('paymentFormCancelled');
      formContainer.dispatchEvent(event);
    });
  }
  
  // Manejar envío del formulario
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Recoger datos del formulario
      const paymentData = {
        id: document.getElementById('payment-method-id')?.value || '',
        metodoPago: methodTypeSelect?.value || 'tarjeta',
        guardarParaFuturo: document.getElementById('save-payment-method')?.checked || false
      };
      
      // Si es tarjeta, añadir número
      if (paymentData.metodoPago === 'tarjeta') {
        const part1 = document.getElementById('card-number-1')?.value || '';
        const part2 = document.getElementById('card-number-2')?.value || '';
        const part3 = document.getElementById('card-number-3')?.value || '';
        const part4 = document.getElementById('card-number-4')?.value || '';
        
        // Validar número de tarjeta
        if (part1.length !== 4 || part2.length !== 4 || part3.length !== 4 || part4.length !== 4) {
          // Mostrar error, preferiblemente usando el sistema Notify si está disponible
          if (typeof Notify !== 'undefined' && typeof Notify.warning === 'function') {
            Notify.warning(getI18nMessage('account.cardNumberFormat') || 'El número de tarjeta debe tener 16 dígitos');
          } else {
            alert(getI18nMessage('account.cardNumberFormat') || 'El número de tarjeta debe tener 16 dígitos');
          }
          return;
        }
        
        paymentData.numeroTarjeta = part1 + part2 + part3 + part4;
      }
      
      console.log('Datos del formulario:', paymentData);
      
      // Disparar evento con los datos
      const event = new CustomEvent('paymentFormSubmitted', {
        detail: { paymentData }
      });
      formContainer.dispatchEvent(event);
    });
  }
}

/**
 * Inicializa el selector de métodos de pago en el proceso de checkout
 * 
 * @param {string} containerId - ID del contenedor para el selector
 * @param {string} formContainerId - ID del contenedor para el formulario
 * @param {Function} onCompleteCallback - Función a ejecutar cuando se completa la selección
 */
function initializeCheckoutPaymentSelector(containerId, formContainerId, onCompleteCallback) {
  const container = document.getElementById(containerId);
  const formContainer = document.getElementById(formContainerId);
  
  if (!container || !formContainer) return;
  
  // Título de la sección
  if (!container.querySelector('h5')) {
    const sectionTitle = document.createElement('h5');
    sectionTitle.className = 'mb-3 mt-4';
    sectionTitle.innerHTML = `
      <i class="fas fa-credit-card mr-2"></i> 
      ${getI18nMessage('checkout.paymentMethod') || 'Método de pago'}
    `;
    container.appendChild(sectionTitle);
  }
  
  // Contenedor para métodos de pago
  let methodsContainer = container.querySelector('#payment-methods-list');
  if (!methodsContainer) {
    methodsContainer = document.createElement('div');
    methodsContainer.id = 'payment-methods-list';
    methodsContainer.className = 'payment-methods-container mb-4';
    container.appendChild(methodsContainer);
  }
  
  // Cargar métodos de pago
  loadUserPaymentMethods('payment-methods-list', (selectedMethod) => {
    // Callback cuando se selecciona un método
    formContainer.innerHTML = ''; // Limpiar contenedor
    
    // Inicializar formulario según si es edición o nuevo
    initializePaymentMethodForm(selectedMethod, formContainerId);
    
    // Manejar envío del formulario
    formContainer.addEventListener('paymentFormSubmitted', (e) => {
      const paymentData = e.detail.paymentData;
      
      // Aquí podríamos hacer validaciones adicionales o guardar en servidor
      
      // Llamar al callback con los datos del pago
      if (typeof onCompleteCallback === 'function') {
        onCompleteCallback(paymentData);
      }
      
      // Limpiar formulario
      formContainer.innerHTML = '';
    });
    
    // Manejar cancelación
    formContainer.addEventListener('paymentFormCancelled', () => {
      // Deseleccionar todos los métodos
      document.querySelectorAll('.payment-method-card').forEach(el => {
        el.classList.remove('selected');
      });
    });
  });
  
  // Añadir información adicional sobre métodos de pago
  if (!container.querySelector('.payment-info-text')) {
    const infoText = document.createElement('p');
    infoText.className = 'text-muted small payment-info-text';
    infoText.innerHTML = `
      <i class="fas fa-info-circle mr-1"></i>
      ${getI18nMessage('checkout.paymentMethodsInfo') || 
      'Los métodos de pago que uses se guardarán para facilitar tus futuras compras.'}
    `;
    container.appendChild(infoText);
  }
}

// Añadir estilos para los componentes de pago
function addPaymentStyles() {
  // Verificar que los estilos no estén ya añadidos
  if (document.getElementById('payment-system-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'payment-system-styles';
  style.textContent = `
    .payment-method-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .payment-method-card:hover {
      background-color: #f8f9fa;
      border-color: #adb5bd;
    }
    
    .payment-method-card.selected {
      border-color: #007bff;
      background-color: #f0f7ff;
      box-shadow: 0 0 0 1px #007bff;
    }
    
    .payment-method-new {
      border-style: dashed;
      background-color: #f8f9fa;
    }
    
    .payment-method-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
    }
    
    .selected .payment-method-icon {
      color: #007bff;
    }
    
    .payment-method-new .payment-method-icon {
      color: #28a745;
    }
    
    .card-input-container .row {
      margin-left: -5px;
      margin-right: -5px;
    }
    
    .card-input-container .col-3 {
      padding-left: 5px;
      padding-right: 5px;
    }
  `;
  document.head.appendChild(style);
}

// Inicializar estilos cuando se carga el DOM
document.addEventListener('DOMContentLoaded', addPaymentStyles);

// Exportar funciones públicas
window.PaymentSystem = {
  loadUserPaymentMethods,
  initializePaymentMethodForm,
  initializeCheckoutPaymentSelector,
  addPaymentStyles,
  setDefaultPaymentMethod,
  deletePaymentMethod,
};