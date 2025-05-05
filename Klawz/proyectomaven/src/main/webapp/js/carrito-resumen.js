/**
 * carrito-resumen.js - actualizado con sistema de pagos mejorado
 * -----------------------------------------------------------
 * Este script gestiona:
 * - Resumen del carrito en el checkout
 * - Verificación de stock actual
 * - Selección de método de pago y dirección de envío
 * - Procesamiento del pedido
 */

let allProducts = [];
let currentDiscount = 0;
let shippingCost = 5;
let selectedPaymentMethod = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Cargar productos primero
    await cargarProductosFrescos();
    
    // Renderizar el carrito con los datos disponibles
    renderResumenCarrito();
    
    // Verificar el stock después del renderizado inicial
    const hayActualizaciones = await verificarYActualizarCarrito();
    if (hayActualizaciones) {
      console.log('🔄 Se han aplicado actualizaciones al carrito');
      mostrarMensajeActualizacion();
      // Re-renderizar después de actualizaciones
      renderResumenCarrito();
    }
    

  } catch (err) {
    console.error('❌ Error cargando productos:', err);
    mostrarMensajeError('Error al cargar productos. Por favor, intenta de nuevo más tarde.');
  }

  document.getElementById('btn-continuar').addEventListener('click', () => {
    window.location.href = '../html/shop.jsp';
  });

  document.getElementById('btn-formalizar').addEventListener('click', async () => {
    try {
      // IMPORTANTE: Recargar productos frescos antes de verificar
      await cargarProductosFrescos();
      
      // Verificar si hay cambios en el stock
      const hayActualizaciones = await verificarYActualizarCarrito();

      if (hayActualizaciones) {
        // Si hubo cambios, mostrar mensaje y NO abrir el formulario
        mostrarMensajeActualizacion();
        // IMPORTANTE: Volver a renderizar para mostrar los cambios visuales
        renderResumenCarrito();
        return; // ¡Importante! No continuar con la apertura del formulario
      }

      // Si no hubo cambios, mostrar el formulario
      document.getElementById('formulario-checkout').style.display = 'block';
      document.getElementById('btn-formalizar').style.display = 'none';
      
      // Cargar datos de dirección del usuario
      cargarDireccionUsuario();
      
      // Inicializar la edición de dirección
      setTimeout(inicializarEdicionDireccion, 100);
      
      // Inicializar sistema de selección de pago
      inicializarSelectorPago();
    } catch (err) {
      console.error('❌ Error verificando stock:', err);
      mostrarMensajeError('Error al verificar disponibilidad. Por favor, intenta de nuevo.');
    }
  });

  document.getElementById('cancelar-compra').addEventListener('click', () => {
    document.getElementById('formulario-checkout').style.display = 'none';
    document.getElementById('btn-formalizar').style.display = 'inline-block';
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    window.location.href = '../logout-servlet';
  });

  document.getElementById('checkout-form').addEventListener('submit', enviarPedido);
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    renderResumenCarrito();
  });
});

/**
 * Inicializa el selector de método de pago en el checkout
 */
/**
 * Inicializa el selector de método de pago en el checkout
 * Versión actualizada para usar el sistema de pagos mejorado
 */
function inicializarSelectorPago() {
  console.log('Inicializando selector de método de pago');
  
  // 1. Limpiar cualquier sección existente para evitar duplicación
  const existingContainer = document.getElementById('pago-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // 2. Crear un nuevo contenedor único para toda la sección de pagos
  const pagoContainer = document.createElement('div');
  pagoContainer.id = 'pago-container';
  pagoContainer.className = 'mt-4 mb-4';
  
  // 3. Ubicarlo correctamente
  const formGroups = document.querySelectorAll('.form-group');
  let lastAddressField = null;
  
  for (const group of formGroups) {
    if (group.querySelector('#provincia')) {
      lastAddressField = group;
    }
  }
  
  // Insertar después del último campo de dirección o usar opciones de fallback
  if (lastAddressField && lastAddressField.parentNode) {
    lastAddressField.parentNode.insertBefore(pagoContainer, lastAddressField.nextSibling);
  } else {
    // Si no encuentra, buscar la última fila de formulario
    const formRows = document.querySelectorAll('.form-row');
    if (formRows.length > 0 && formRows[formRows.length-1].parentNode) {
      formRows[formRows.length-1].parentNode.insertBefore(pagoContainer, formRows[formRows.length-1].nextSibling);
    } else {
      // Como último recurso, añadir al final del formulario
      const checkoutForm = document.getElementById('checkout-form');
      if (checkoutForm) {
        checkoutForm.appendChild(pagoContainer);
      }
    }
  }
  
  // 4. Construir estructura HTML básica
  pagoContainer.innerHTML = `
    <h5 class="mb-3">
      <i class="fas fa-credit-card mr-2"></i>
      Método de pago
    </h5>
    <div id="payment-methods-list" class="payment-methods-container mb-3"></div>
    <div id="payment-form-container" class="payment-form-container mt-3"></div>
    <p class="text-muted small mt-2">
      <i class="fas fa-info-circle mr-1"></i>
      Los métodos de pago que uses se guardarán para facilitar tus futuras compras.
    </p>
  `;
  
  // 5. Cargar métodos de pago de forma simplificada
  mostrarMetodosPagoSimple();
}

// Método simplificado para mostrar opciones de pago sin i18n
function mostrarMetodosPagoSimple() {
  const container = document.getElementById('payment-methods-list');
  if (!container) return;
  
  // Intentar obtener métodos del usuario sin depender de i18n
  try {
    // Mostrar indicador de carga
    container.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="sr-only">Cargando...</span>
        </div>
        <p class="mb-0 mt-2">Cargando métodos de pago...</p>
      </div>
    `;
    
    // Establecer timeout para evitar carga infinita
    const timeoutId = setTimeout(() => {
      mostrarOpcionesBasicas();
    }, 3000);
    
    // Función para mostrar opciones básicas
    function mostrarOpcionesBasicas() {
      container.innerHTML = '';
      
      // Opción para tarjeta
      const tarjetaCard = crearOpcionPago('tarjeta', 'Tarjeta de crédito', 'fa-credit-card');
      container.appendChild(tarjetaCard);
      
      // Opción para transferencia
      const transferenciaCard = crearOpcionPago('transferencia', 'Transferencia bancaria', 'fa-university');
      container.appendChild(transferenciaCard);
      
      // Opción para Bizum
      const bizumCard = crearOpcionPago('bizum', 'Bizum', 'fa-mobile-alt');
      container.appendChild(bizumCard);
      
      // Opción para contrareembolso
      const contrareembolsoCard = crearOpcionPago('contrareembolso', 'Contra reembolso', 'fa-money-bill-wave');
      container.appendChild(contrareembolsoCard);
    }
    
    // Función auxiliar para crear opciones de pago
    function crearOpcionPago(tipo, nombre, icono) {
      const card = document.createElement('div');
      card.className = 'payment-method-card';
      card.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <i class="fas ${icono} fa-lg"></i>
          </div>
          <div>
            <div class="font-weight-bold">${nombre}</div>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        // Deseleccionar todos
        document.querySelectorAll('.payment-method-card').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Seleccionar este
        card.classList.add('selected');
        
        // Mostrar formulario según tipo
        mostrarFormularioSegunTipo(tipo);
        
        // IMPORTANTE: Guardar la selección en variable global
        window.selectedPaymentMethod = {
          id: null,
          type: tipo,
          isNew: true
        };
      });
      
      return card;
    }
    
    // Función para mostrar formulario según tipo seleccionado
    function mostrarFormularioSegunTipo(tipo) {
      const formContainer = document.getElementById('payment-form-container');
      if (!formContainer) return;
      
      // Plantilla base del formulario
      let formHTML = `
        <form id="payment-form" class="border p-3 rounded bg-light">
          <h6 class="mb-3">Detalles del método de pago</h6>
      `;
      
      // Campos específicos según tipo
      if (tipo === 'tarjeta') {
        formHTML += `
          <div class="form-group">
            <label for="card-number">Número de tarjeta</label>
            <input type="text" class="form-control" id="card-number" name="card-number" 
                   placeholder="1234 5678 9012 3456" required maxlength="16">
            <small class="d-block mt-2 text-muted">Ingrese los 16 dígitos de su tarjeta</small>
          </div>
        `;
      }
      
      // Opción de guardar para futuras compras
      formHTML += `
        <div class="form-check mb-3">
          <input type="checkbox" class="form-check-input" id="save-payment" name="save-payment" checked>
          <label class="form-check-label" for="save-payment">
            Guardar para futuras compras
          </label>
        </div>
        
        <div class="form-group">
          <button type="button" id="btn-confirm-payment" class="btn btn-primary">Confirmar método de pago</button>
        </div>
        </form>
      `;
      
      // Mostrar el formulario
      formContainer.innerHTML = formHTML;
      
      // CORRECCIÓN: Usar botón de tipo button en vez de submit
      const confirmBtn = document.getElementById('btn-confirm-payment');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
          // Guardar selección
          window.selectedPaymentMethod = {
            id: null,
            type: tipo,
            isNew: true,
            saveForFuture: document.getElementById('save-payment')?.checked || false
          };
          
          // Si es tarjeta, obtener y validar número
          if (tipo === 'tarjeta') {
            const cardNumber = document.getElementById('card-number')?.value || '';
            
            if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
              alert('Ingrese un número de tarjeta válido de 16 dígitos');
              return;
            }
            
            window.selectedPaymentMethod.cardNumber = cardNumber;
          }
          
          // Mostrar confirmación
          formContainer.innerHTML = `
            <div class="alert alert-success">
              <i class="fas fa-check-circle mr-1"></i>
              getI18nMessage('checkout.paymentMethodConfirmed')
            </div>
          `;
        });
      }
    }
    
    // Intentar obtener métodos guardados del servidor
    fetch('../metodos-pago-servlet?tipo=favoritos')
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(methods => {
        if (!methods || methods.length === 0) {
          // Si no hay métodos guardados, mostrar opciones básicas
          mostrarOpcionesBasicas();
        } else {
          // Si hay métodos, mostrarlos
          container.innerHTML = '';
          
          methods.forEach(method => {
            // Determinar icono según tipo
            let icon;
            switch(method.metodoPago) {
              case 'tarjeta': icon = 'fa-credit-card'; break;
              case 'transferencia': icon = 'fa-university'; break;
              case 'bizum': icon = 'fa-mobile-alt'; break;
              case 'contrareembolso': icon = 'fa-money-bill-wave'; break;
              default: icon = 'fa-credit-card';
            }
            
            // Crear tarjeta para método guardado
            const methodCard = document.createElement('div');
            methodCard.className = 'payment-method-card';
            methodCard.innerHTML = `
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas ${icon} fa-lg"></i>
                </div>
                <div>
                  <div class="font-weight-bold">${method.metodoPago}</div>
                  ${method.numeroTarjetaHashed ? `<div class="small text-muted">Termina en ${method.numeroTarjetaHashed.slice(-4)}</div>` : ''}
                </div>
              </div>
            `;
            
            methodCard.addEventListener('click', () => {
              // Deseleccionar todos
              document.querySelectorAll('.payment-method-card').forEach(el => {
                el.classList.remove('selected');
              });
              
              // Seleccionar este
              methodCard.classList.add('selected');
              
              // Guardar selección
              window.selectedPaymentMethod = {
                id: method.id,
                type: method.metodoPago,
                isNew: false,
                esFavorito: true
              };
              
              // Mostrar confirmación
              document.getElementById('payment-form-container').innerHTML = `
                <div class="alert alert-success">
                  <i class="fas fa-check-circle mr-1"></i>
                  Método de pago seleccionado
                </div>
              `;
            });
            
            container.appendChild(methodCard);
          });
          
          // Añadir opción para nuevo método
          const newMethodCard = document.createElement('div');
          newMethodCard.className = 'payment-method-card payment-method-new';
          newMethodCard.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas fa-plus-circle fa-lg"></i>
              </div>
              <div>
                <div class="font-weight-bold">Usar nuevo método de pago</div>
              </div>
            </div>
          `;
          
          newMethodCard.addEventListener('click', () => {
            // Deseleccionar todos
            document.querySelectorAll('.payment-method-card').forEach(el => {
              el.classList.remove('selected');
            });
            
            // Seleccionar este
            newMethodCard.classList.add('selected');
            
            // Mostrar opciones básicas
            mostrarOpcionesBasicas();
          });
          
          container.appendChild(newMethodCard);
        }
      })
      .catch(error => {
        console.error('Error cargando métodos de pago:', error);
        clearTimeout(timeoutId);
        mostrarOpcionesBasicas();
      });
  } catch (error) {
    console.error('Error general en mostrarMetodosPagoSimple:', error);
    // Mostrar opciones básicas en caso de error
    container.innerHTML = '';
    
    // Mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning mb-3';
    errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No se pudieron cargar los métodos guardados';
    container.appendChild(errorDiv);
    
    // Mostrar opciones básicas
    const tarjetaCard = crearOpcionPago('tarjeta', 'Tarjeta de crédito', 'fa-credit-card');
    container.appendChild(tarjetaCard);
    
    const transferenciaCard = crearOpcionPago('transferencia', 'Transferencia bancaria', 'fa-university');
    container.appendChild(transferenciaCard);
    
    const bizumCard = crearOpcionPago('bizum', 'Bizum', 'fa-mobile-alt');
    container.appendChild(bizumCard);
    
    const contrareembolsoCard = crearOpcionPago('contrareembolso', 'Contra reembolso', 'fa-money-bill-wave');
    container.appendChild(contrareembolsoCard);
  }
}

/**
 * Carga los métodos de pago usados previamente por el usuario
 */
/**
 * Carga los métodos de pago usados previamente por el usuario
 * Versión actualizada que mantiene compatibilidad con el sistema original
 */
/**
 * Carga los métodos de pago usados previamente por el usuario
 * Versión actualizada que mantiene compatibilidad con el sistema original
 */
function cargarMetodosPago() {
  const container = document.getElementById('payment-methods-list');
  if (!container) return;
  
  // Si existe el sistema mejorado pero no se usó en inicialización, usarlo ahora
  if (window.PaymentSystem && typeof window.PaymentSystem.loadUserPaymentMethods === 'function') {
    window.PaymentSystem.loadUserPaymentMethods('payment-methods-list', function(selectedMethod) {
      // Callback cuando se selecciona un método
      if (selectedMethod === null) {
        // Se seleccionó "Nuevo método"
        mostrarFormularioNuevoMetodoPago();
      } else {
        // Se seleccionó un método existente
        selectedPaymentMethod = {
          id: selectedMethod.id,
          type: selectedMethod.metodoPago,
          isNew: false
        };
        
        // Ocultar formulario de nuevo método
        document.getElementById('payment-form-container').innerHTML = '';
      }
    });
    return;
  }
  
  // Implementación original (código existente)
  // Mostrar spinner de carga
  container.innerHTML = `
    <div class="text-center py-3">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="sr-only">${getI18nMessage('general.loading')}</span>
      </div>
      <p class="my-2 text-muted">${getI18nMessage('account.loadingPayments')}</p>
    </div>
  `;
  
  // Cargar métodos de pago desde el servidor
  fetch('../metodos-pago-servlet')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(methods => {
      renderizarMetodosPago(methods);
    })
    .catch(error => {
      console.error('Error cargando métodos de pago:', error);
      container.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> 
          ${getI18nMessage('error.loadingPaymentMethods') || 'Error al cargar métodos de pago.'}
        </div>
      `;
      // Mostrar formulario para nuevo método de pago
      mostrarFormularioNuevoMetodoPago();
    });
}

/**
 * Renderiza los métodos de pago en la interfaz
 * @param {Array} methods - Lista de métodos de pago 
 */
function renderizarMetodosPago(methods) {
  const container = document.getElementById('payment-methods-list');
  if (!container) return;
  
  // Limpiar el contenedor
  container.innerHTML = '';
  
  // Si hay métodos guardados, mostrarlos
  if (methods && methods.length > 0) {
    methods.forEach(method => {
      const methodCard = document.createElement('div');
      methodCard.className = 'payment-method-card';
      methodCard.dataset.id = method.id;
      methodCard.dataset.type = method.metodoPago;
      
      // Determinar icono según tipo
      let icon, label;
      switch(method.metodoPago) {
        case 'tarjeta':
          icon = 'fa-credit-card';
          label = getI18nMessage('checkout.creditCard');
          break;
        case 'transferencia':
          icon = 'fa-university';
          label = getI18nMessage('checkout.bankTransfer');
          break;
        case 'bizum':
          icon = 'fa-mobile-alt';
          label = 'Bizum';
          break;
        case 'contrareembolso':
          icon = 'fa-money-bill-wave';
          label = getI18nMessage('checkout.cash');
          break;
        default:
          icon = 'fa-credit-card';
          label = method.metodoPago;
      }
      
      // Crear contenido de la tarjeta
      methodCard.innerHTML = `
        <div class="d-flex align-items-center payment-method-content">
          <div class="payment-method-icon">
            <i class="fas ${icon}"></i>
          </div>
          <div class="payment-method-details">
            <div class="payment-method-name">${label}</div>
            ${method.numeroTarjetaHashed ? 
              `<div class="payment-method-info">
                ${getI18nMessage('checkout.endingIn')} ${method.numeroTarjetaHashed}
              </div>` : 
              ''}
          </div>
        </div>
      `;
      
      // Evento de selección
      methodCard.addEventListener('click', () => {
        // Deseleccionar todos los métodos
        container.querySelectorAll('.payment-method-card').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Seleccionar este método
        methodCard.classList.add('selected');
        
        // Guardar el método seleccionado
        selectedPaymentMethod = {
          id: method.id,
          type: method.metodoPago,
          isNew: false
        };
        
        // Ocultar formulario de pago
        document.getElementById('payment-form-container').innerHTML = '';
      });
      
      container.appendChild(methodCard);
    });
  }
  
  // Añadir opción para nuevo método
  const newMethodCard = document.createElement('div');
  newMethodCard.className = 'payment-method-card payment-method-new';
  newMethodCard.innerHTML = `
    <div class="d-flex align-items-center payment-method-content">
      <div class="payment-method-icon">
        <i class="fas fa-plus-circle"></i>
      </div>
      <div class="payment-method-details">
        <div class="payment-method-name">
          ${getI18nMessage('checkout.useNewPayment') || 'Usar nuevo método de pago'}
        </div>
      </div>
    </div>
  `;
  
  // Evento para nuevo método
  newMethodCard.addEventListener('click', () => {
    // Deseleccionar todos los métodos
    container.querySelectorAll('.payment-method-card').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Seleccionar este método
    newMethodCard.classList.add('selected');
    
    // Mostrar formulario para nuevo método
    mostrarFormularioNuevoMetodoPago();
  });
  
  container.appendChild(newMethodCard);
}

/**
 * Muestra el formulario para introducir un nuevo método de pago
 */
function mostrarFormularioNuevoMetodoPago() {
  const container = document.getElementById('payment-form-container');
  if (!container) {
    console.error('Contenedor de formulario no encontrado');
    return;
  }
  
  console.log('Mostrando formulario para nuevo método de pago');
  
  // Limpiar y crear nuevo formulario
  container.innerHTML = `
    <form id="new-payment-form" class="border p-3 rounded bg-light">
      <h6 class="mb-3">${getI18nMessage('checkout.newPaymentMethod', 'Nuevo método de pago')}</h6>
      
      <div class="form-group">
        <label for="payment-method-type">
          ${getI18nMessage('checkout.selectPaymentMethod', 'Seleccione método de pago')}
        </label>
        <select class="form-control" id="payment-method-type" required>
          <option value="tarjeta">${getI18nMessage('checkout.creditCard', 'Tarjeta de crédito')}</option>
          <option value="transferencia">${getI18nMessage('checkout.bankTransfer', 'Transferencia bancaria')}</option>
          <option value="bizum">Bizum</option>
          <option value="contrareembolso">${getI18nMessage('checkout.cash', 'Contra reembolso')}</option>
        </select>
      </div>
      
      <div id="card-fields" class="form-group">
        <label for="card-number-1">
          ${getI18nMessage('account.cardNumber', 'Número de tarjeta')}
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
            ${getI18nMessage('account.cardNumberHelp', 'Introduzca el número completo de su tarjeta')}
          </small>
        </div>
      </div>
      
      <div class="form-check mb-3">
        <input type="checkbox" class="form-check-input" id="save-payment-method" checked>
        <label class="form-check-label" for="save-payment-method">
          ${getI18nMessage('checkout.saveForFuture', 'Guardar para futuras compras')}
        </label>
        <small class="d-block form-text text-muted">
          ${getI18nMessage('checkout.saveForFutureHelp', 'Esta opción guardará tu método de pago para facilitar futuras compras')}
        </small>
      </div>
      
      <div class="form-group mt-3">
        <button type="submit" class="btn btn-primary">
          ${getI18nMessage('checkout.confirmPayment', 'Confirmar método de pago')}
        </button>
        <button type="button" class="btn btn-secondary ml-2" id="cancel-new-payment">
          ${getI18nMessage('general.cancel', 'Cancelar')}
        </button>
      </div>
    </form>
  `;
  
  // Configurar eventos
  const methodTypeSelect = document.getElementById('payment-method-type');
  const cardFields = document.getElementById('card-fields');
  
  // Auto-focus en campos de tarjeta
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
  
  // Mostrar/ocultar campos de tarjeta según tipo
  if (methodTypeSelect) {
    methodTypeSelect.addEventListener('change', () => {
      if (cardFields) {
        cardFields.style.display = methodTypeSelect.value === 'tarjeta' ? 'block' : 'none';
      }
    });
  }
  
  // Configuración inicial según valor seleccionado
  if (methodTypeSelect && methodTypeSelect.value === 'tarjeta' && cardFields) {
    cardFields.style.display = 'block';
  }
  
  // Cancelar nueva forma de pago
  const cancelButton = document.getElementById('cancel-new-payment');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      // Deseleccionar todos los métodos
      document.querySelectorAll('.payment-method-card').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Limpiar el formulario
      container.innerHTML = '';
      
      // Resetear el método seleccionado
      selectedPaymentMethod = null;
    });
  }
  
  // Manejar envío del formulario
  const form = document.getElementById('new-payment-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Recoger datos del formulario
      const metodoPago = methodTypeSelect ? methodTypeSelect.value : 'tarjeta';
      const guardarParaFuturo = document.getElementById('save-payment-method')?.checked || false;
      
      // Inicializar el método seleccionado
      selectedPaymentMethod = {
        id: null,
        type: metodoPago,
        isNew: true,
        saveForFuture: guardarParaFuturo
      };
      
      // Si es tarjeta, validar y recoger número
      if (metodoPago === 'tarjeta') {
        const part1 = document.getElementById('card-number-1')?.value || '';
        const part2 = document.getElementById('card-number-2')?.value || '';
        const part3 = document.getElementById('card-number-3')?.value || '';
        const part4 = document.getElementById('card-number-4')?.value || '';
        
        // Validar formato
        if (part1.length !== 4 || part2.length !== 4 || part3.length !== 4 || part4.length !== 4) {
          // Mostrar error con Notify si está disponible
          if (typeof Notify !== 'undefined' && typeof Notify.warning === 'function') {
            Notify.warning(getI18nMessage('account.cardNumberFormat') || 'El número de tarjeta debe tener 16 dígitos');
          } else {
            alert(getI18nMessage('account.cardNumberFormat') || 'El número de tarjeta debe tener 16 dígitos');
          }
          return;
        }
        
        // Guardar número completo
        selectedPaymentMethod.cardNumber = part1 + part2 + part3 + part4;
      }
      
      // Mostrar confirmación
      container.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle mr-1"></i>
          ${getI18nMessage('checkout.paymentMethodConfirmed') || 'Método de pago confirmado'}
        </div>
      `;
      
      console.log('Método de pago seleccionado:', selectedPaymentMethod);
    });
  }
}

/**
 * Carga productos frescos desde el servidor con un parámetro para evitar caché
 */
async function cargarProductosFrescos() {
  // Añadir timestamp para evitar caché del navegador
  const timestamp = new Date().getTime();
  const resp = await fetch(`../producto-index?ajax=true&_=${timestamp}`);
  
  if (!resp.ok) {
    throw new Error(`Error HTTP: ${resp.status}`);
  }
  
  allProducts = await resp.json();
  console.log('✅ Productos frescos cargados:', allProducts.length);
  return allProducts;
}

/**
 * Muestra un mensaje de información sobre las actualizaciones del carrito
 */
function mostrarMensajeActualizacion() {
  Notify.warning(getI18nMessage('cart.productsAdjusted'));
}

/**
 * Muestra un mensaje de error genérico
 * @param {string} mensaje - El mensaje de error a mostrar
 */
function mostrarMensajeError(mensaje) {
  Notify.error(getI18nMessage('error.generalError'));
}

/**
 * Verifica el stock actual de los productos en el carrito y lo actualiza si es necesario
 * @returns {Promise<boolean>} True si hubo actualizaciones en el carrito, False si no hubo cambios
 */
async function verificarYActualizarCarrito() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  console.log('📋 Verificando carrito actual:', cart);
  
  let huboActualizaciones = false;

  // Si el carrito está vacío, redireccionar inmediatamente
  if (cart.length === 0) {
    console.log('🛒 Carrito vacío, redirigiendo...');
    window.location.href = '../html/carrito-vacio.jsp';
    return true; // Indicar que hubo una actualización (redirección)
  }

  // Verificar el stock de cada producto y ajustar cantidades
  const nuevoCart = [];
  
  for (const item of cart) {
    const producto = allProducts.find(p => p.id === item.productId);
    console.log(`Producto ID ${item.productId}:`, producto ? `stock: ${producto.stock}` : 'no encontrado');
    
    // Si el producto no existe o no tiene stock, no incluirlo
    if (!producto || producto.stock <= 0) {
      huboActualizaciones = true;
      console.log(`⚠️ Producto eliminado: ID ${item.productId} - no disponible o sin stock`);
      continue;
    } 
    
    // Si la cantidad es mayor que el stock, ajustarla
    if (item.quantity > producto.stock) {
      console.log(`⚠️ Cantidad ajustada para ID ${item.productId}: ${item.quantity} → ${producto.stock}`);
      const nuevaCantidad = parseInt(producto.stock);
      item.quantity = nuevaCantidad;
      huboActualizaciones = true;
    }
    
    nuevoCart.push({...item}); // Hacer una copia para evitar referencias
  }

  // Si el carrito queda vacío después de la verificación
  if (nuevoCart.length === 0) {
    console.log('🛒 Carrito vacío después de verificar stock, redirigiendo...');
    localStorage.removeItem('cart');
    window.location.href = '../html/carrito-vacio.jsp';
    return true; // Indicar que hubo una actualización (redirección)
  }

  // Si hubo cambios, actualizar el localStorage
  if (huboActualizaciones) {
    console.log('🔄 Actualizando carrito en localStorage:', nuevoCart);
    localStorage.setItem('cart', JSON.stringify(nuevoCart));
  }

  console.log(`${huboActualizaciones ? '🔄 Carrito actualizado' : '✅ Carrito sin cambios'}`);
  return huboActualizaciones;
}

/**
 * Renderiza el resumen del carrito en la interfaz
 */
function renderResumenCarrito() {
  const cartTableBody = document.querySelector('#cart-table tbody');
  // Asegurarse de que la tabla está limpia
  cartTableBody.innerHTML = '';
  
  // Obtener el carrito del localStorage (el más actualizado)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  console.log('🖌️ Renderizando carrito:', cart);
  
  // Si el carrito está vacío, redireccionar
  if (cart.length === 0) {
    console.log('🛒 Carrito vacío al renderizar, redirigiendo...');
    window.location.href = '../html/carrito-vacio.jsp';
    return;
  }

  let subtotal = 0;

  // Iterar por cada producto en el carrito
  cart.forEach(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (!product) {
      console.warn(`⚠️ Producto no encontrado al renderizar: ID ${item.productId}`);
      return;
    }

    const subtotalProd = product.precio * item.quantity;
    subtotal += subtotalProd;

    // Crear la fila para la tabla
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="../${product.imagenes[0]}" style="width: 60px; height: 60px; object-fit: cover"></td>
      <td><h5 class="nombre-producto">${product.nombre}</h5></td>
      <td>${product.precio.toFixed(2)} €</td>
      <td>${item.quantity}</td>
      <td>${subtotalProd.toFixed(2)} €</td>
    `;
    cartTableBody.appendChild(tr);
  });

  // Actualizar los totales
  document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2) + ' €';
  document.getElementById('cart-shipping').textContent = shippingCost.toFixed(2) + ' €';
  let total = subtotal + shippingCost - currentDiscount;
  if (total < 0) total = 0;
  document.getElementById('cart-total').textContent = total.toFixed(2) + ' €';
  
  console.log('✅ Resumen del carrito renderizado correctamente');
}

/**
 * Carga los datos de dirección del usuario desde el servidor
 * y los muestra en el formulario de checkout
 */
function cargarDireccionUsuario() {
  // Primero intentamos cargar la dirección predeterminada
  fetch('../direccion-predeterminada-servlet?accion=obtener')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener dirección predeterminada');
      }
      return response.json();
    })
    .then(direccion => {
      if (direccion && direccion.domicilio) {
        // Si tenemos dirección predeterminada, la usamos
        document.getElementById('domicilio').value = direccion.domicilio || '';
        document.getElementById('cp').value = direccion.cp || '';
        document.getElementById('poblacion').value = direccion.poblacion || '';
        document.getElementById('provincia').value = direccion.provincia || '';
        document.getElementById('telefono').value = direccion.telefono || '';
        
        // Guardar copia para posible cancelación
        sessionStorage.setItem('direccionOriginal', JSON.stringify(direccion));
      } else {
        // Si no hay dirección predeterminada, usar datos de sesión (código existente)
        usarDatosDeSesion();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Si hay error, intentar con datos de sesión
      usarDatosDeSesion();
    });
  
  // Función auxiliar para utilizar datos de sesión
  function usarDatosDeSesion() {
    // Usamos los datos de la sesión que la página envía como parte del JSP
    const datos = {
      domicilio: typeof usuarioDomicilio !== 'undefined' ? usuarioDomicilio : '',
      cp: typeof usuarioCp !== 'undefined' ? usuarioCp : '',
      poblacion: typeof usuarioPoblacion !== 'undefined' ? usuarioPoblacion : '',
      provincia: typeof usuarioProvincia !== 'undefined' ? usuarioProvincia : '',
      telefono: typeof usuarioTelefono !== 'undefined' ? usuarioTelefono : ''
    };
    
    console.log('Usando datos de usuario de la sesión');
    
    // Si hay datos en la sesión, usarlos
    if (datos.domicilio) {
      document.getElementById('domicilio').value = datos.domicilio;
      document.getElementById('cp').value = datos.cp;
      document.getElementById('poblacion').value = datos.poblacion;
      document.getElementById('provincia').value = datos.provincia;
      document.getElementById('telefono').value = datos.telefono;
      
      // Guardar copia para posible cancelación
      sessionStorage.setItem('direccionOriginal', JSON.stringify(datos));
    }
  }
}

/**
 * Inicializa la funcionalidad de edición de dirección
 */
function inicializarEdicionDireccion() {
  guardarDireccionOriginal();
  habilitarEdicionDireccion();
}

/**
 * Función para habilitar la edición de la dirección de envío durante el checkout
 */
function habilitarEdicionDireccion() {
  const btnEditar = document.getElementById('btn-editar-direccion');
  const formFields = document.querySelectorAll('#formulario-checkout input[type="text"]');
  const btnGuardar = document.getElementById('btn-guardar-direccion');
  const btnCancelar = document.getElementById('btn-cancelar-edicion');
  
  if (!btnEditar) return;
  
  btnEditar.addEventListener('click', () => {
    // Habilitar los campos
    formFields.forEach(field => {
      if (field.id !== 'nombre') { // Mantener el nombre como readonly
        field.readOnly = false;
      }
    });
    
    // Mostrar botones de acción
    btnEditar.style.display = 'none';
    btnGuardar.style.display = 'inline-block';
    btnCancelar.style.display = 'inline-block';
  });
  
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      // Recargar los datos originales
      cargarDireccionOriginal();
      
      // Deshabilitar los campos
      formFields.forEach(field => {
        field.readOnly = true;
      });
      
      // Mostrar/ocultar botones
      btnEditar.style.display = 'inline-block';
      btnGuardar.style.display = 'none';
      btnCancelar.style.display = 'none';
    });
  }
  
  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => {
      guardarDireccionActualizada();
    });
  }
}

/**
 * Carga los datos originales de la dirección de envío
 */
function cargarDireccionOriginal() {
  // Si tenemos datos guardados, restaurarlos
  const datosOriginales = JSON.parse(sessionStorage.getItem('direccionOriginal') || '{}');
  
  if (datosOriginales.domicilio) {
    document.getElementById('domicilio').value = datosOriginales.domicilio;
    document.getElementById('cp').value = datosOriginales.cp;
    document.getElementById('poblacion').value = datosOriginales.poblacion;
    document.getElementById('provincia').value = datosOriginales.provincia;
    document.getElementById('telefono').value = datosOriginales.telefono;
  }
}

/**
 * Guarda la dirección de envío actualizada
 */
function guardarDireccionActualizada() {
  // Recoger los datos actuales del formulario
  const direccion = {
    domicilio: document.getElementById('domicilio').value,
    cp: document.getElementById('cp').value,
    poblacion: document.getElementById('poblacion').value,
    provincia: document.getElementById('provincia').value,
    telefono: document.getElementById('telefono').value
  };
  
  // Validar que todos los campos estén completos
  for (const key in direccion) {
    if (typeof direccion[key] === 'string' && direccion[key].trim() === '') {
      Notify.warning(getI18nMessage('error.required'));
      return;
    }
  }
  
  // Deshabilitar campos y mostrar/ocultar botones
  const formFields = document.querySelectorAll('#formulario-checkout input[type="text"]');
  formFields.forEach(field => {
    if (field.id !== 'nombre') {
      field.readOnly = true;
    }
  });
  
  document.getElementById('btn-editar-direccion').style.display = 'inline-block';
  document.getElementById('btn-guardar-direccion').style.display = 'none';
  document.getElementById('btn-cancelar-edicion').style.display = 'none';
  
  // Guardar en sessionStorage para recuperación si es necesario
  sessionStorage.setItem('direccionOriginal', JSON.stringify(direccion));
  
  // Verificar si hay un pedido en curso
  const pedidoId = sessionStorage.getItem('pedidoTemp');
  
  if (pedidoId) {
    // Si hay un pedido, actualizar vía AJAX
    direccion.pedidoId = parseInt(pedidoId);
    
    fetch('../actualizar-direccion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(direccion)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Mostrar mensaje de éxito
        Notify.success(getI18nMessage('success.dataUpdate'));
        
        // Preguntar si se desea guardar en el perfil
        preguntarGuardarEnPerfil(direccion);
      } else {
        Notify.error(data.error || getI18nMessage('error.generalError'));
      }
    })
    .catch(error => {
      console.error('Error en fetch:', error);
      Notify.error(getI18nMessage('error.generalError'));
    });
  } else {
    // Si no hay pedido, simplemente guardar localmente
    Notify.success(getI18nMessage('success.dataUpdate'));
  }
}

/**
 * Pregunta al usuario si desea guardar la dirección en su perfil
 */
function preguntarGuardarEnPerfil(direccion) {
  // Verificar si la pregunta ya existe
  if (document.getElementById('guardar-perfil-pregunta')) {
    document.getElementById('guardar-perfil-pregunta').remove();
  }
  
  const guardarPregunta = document.createElement('div');
  guardarPregunta.id = 'guardar-perfil-pregunta';
  guardarPregunta.className = 'mt-3 alert alert-info';
  guardarPregunta.innerHTML = `
    <p>${getI18nMessage('checkout.saveAddressQuestion')}</p>
    <div class="mt-2">
      <button type="button" class="btn btn-sm btn-primary save-address-yes">${getI18nMessage('general.yes')}</button>
      <button type="button" class="btn btn-sm btn-secondary ml-2 save-address-no">${getI18nMessage('general.no')}</button>
    </div>
  `;
  
  // Añadir a la UI
  const formularioCheckout = document.getElementById('formulario-checkout');
  formularioCheckout.appendChild(guardarPregunta);
  
  // Configurar eventos
  guardarPregunta.querySelector('.save-address-yes').addEventListener('click', function() {
    // Llamada AJAX para actualizar la dirección predeterminada
    fetch('../direccion-predeterminada-servlet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domicilio: direccion.domicilio,
        poblacion: direccion.poblacion,
        provincia: direccion.provincia,
        cp: direccion.cp,
        telefono: direccion.telefono,
        guardarComoPredeterminada: true
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Notify.success(getI18nMessage('profile.addressSaved'));
      } else {
        Notify.error(data.error || getI18nMessage('error.generalError'));
      }
      formularioCheckout.removeChild(guardarPregunta);
    })
    .catch(error => {
      console.error('Error:', error);
      Notify.error(getI18nMessage('error.generalError'));
      formularioCheckout.removeChild(guardarPregunta);
    });
  });
  
  guardarPregunta.querySelector('.save-address-no').addEventListener('click', function() {
    formularioCheckout.removeChild(guardarPregunta);
  });
}

/**
 * Guarda la dirección original al cargar el formulario
 */
function guardarDireccionOriginal() {
  const direccion = {
    domicilio: document.getElementById('domicilio').value,
    cp: document.getElementById('cp').value,
    poblacion: document.getElementById('poblacion').value,
    provincia: document.getElementById('provincia').value,
    telefono: document.getElementById('telefono').value
  };
  
  sessionStorage.setItem('direccionOriginal', JSON.stringify(direccion));
}

/**
 * Procesa el envío del formulario de checkout
 * @param {Event} e - Evento del formulario
 */
async function enviarPedido(e) {
  e.preventDefault();

  try {
    // Verificaciones actuales de stock
    await cargarProductosFrescos();
    
    const hayActualizaciones = await verificarYActualizarCarrito();
    if (hayActualizaciones) {
      mostrarMensajeActualizacion();
      renderResumenCarrito();
      document.getElementById('formulario-checkout').style.display = 'none';
      document.getElementById('btn-formalizar').style.display = 'inline-block';
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar que el carrito no esté vacío
    if (cart.length === 0) {
      console.log('🛒 Carrito vacío al enviar pedido, redirigiendo...');
      window.location.href = '../html/carrito-vacio.jsp';
      return;
    }

    // Validar que se haya seleccionado un método de pago
    if (!window.selectedPaymentMethod) {
      alert('Por favor, seleccione un método de pago');
      
      // Hacer scroll hasta la sección de pagos
      const pagoContainer = document.getElementById('pago-container');
      if (pagoContainer) {
        pagoContainer.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // CORRECCIÓN: Asegurar que la tarjeta tenga número
    if (window.selectedPaymentMethod.type === 'tarjeta' && window.selectedPaymentMethod.isNew) {
      if (!window.selectedPaymentMethod.cardNumber) {
        alert('Por favor, ingrese el número de tarjeta');
        return;
      }
    }

    // Recoger los datos del formulario
    const domicilio = document.getElementById('domicilio').value.trim();
    const cp = document.getElementById('cp').value.trim();
    const poblacion = document.getElementById('poblacion').value.trim();
    const provincia = document.getElementById('provincia').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    // Validar campos de dirección
    if (!domicilio || !cp || !poblacion || !provincia || !telefono) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // Preparar datos para enviar
    const datos = {
      carrito: cart,
      domicilio,
      cp,
      poblacion,
      provincia,
      telefono,
      metodoPago: window.selectedPaymentMethod.type
    };

    // Procesar datos según el tipo de método de pago
    if (window.selectedPaymentMethod.isNew) {
      // Si es un método nuevo
      if (window.selectedPaymentMethod.type === 'tarjeta') {
        // Para tarjeta nueva, verificar y recoger número completo
        if (window.selectedPaymentMethod.cardNumber) {
          datos.numeroTarjeta = window.selectedPaymentMethod.cardNumber;
        }
      }
      
      // Verificar si se debe guardar para uso futuro
      if (window.selectedPaymentMethod.saveForFuture !== undefined) {
        datos.guardarMetodoPago = window.selectedPaymentMethod.saveForFuture;
      }
    } else {
      // Si es un método existente, enviar su ID
      datos.metodoPagoFavoritoId = window.selectedPaymentMethod.id;
      datos.esFavorito = true;
    }

    // Deshabilitar botón para evitar doble click
    const submitButton = document.querySelector('#checkout-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> getI18nMessage('general.processing')`;
    }
    
    // Mostrar un mensaje de espera
    const formContainer = document.getElementById('formulario-checkout');
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'alert alert-info mt-3';
    loadingMessage.innerHTML = '<strong>Procesando pedido...</strong> No cierres esta ventana.';
    formContainer.appendChild(loadingMessage);
    
    // Enviar petición al servidor
    console.log("Enviando datos del pedido al servidor:", datos);
    const response = await fetch('../checkout-servlet', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Respuesta del servidor:", result);
    
    if (result.success) {
      // Limpiar carrito en localStorage
      localStorage.removeItem('cart');
      
      // Redirigir a la página de confirmación con un retraso para que el usuario pueda ver el mensaje
      setTimeout(() => {
        try {
          window.location.href = `../html/confirmacion.jsp?pedido=${result.pedidoId}`;
        } catch (err) {
          console.error('Error en la redirección:', err);
          // Redirección alternativa en caso de error
          window.location.replace(`../html/confirmacion.jsp?pedido=${result.pedidoId}`);
        }
      }, 1500);
    } else if (result.empty) {
      // Si el carrito está vacío
      localStorage.removeItem('cart');
      window.location.href = '../html/carrito-vacio.jsp';
    } else {
      // Si hay algún otro error
      throw new Error(result.error || 'Error al procesar el pedido');
    }
    
  } catch (err) {
    console.error('❌ Error al procesar el pedido:', err);
    alert('Ha ocurrido un error al procesar el pedido: ' + (err.message || 'Error desconocido'));
    
    // Reactivar botón
    const submitButton = document.querySelector('#checkout-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Realizar pedido';
    }
  }
}

