/**
 * cambiardatos.js - Sistema centralizado para gestionar datos de usuario (VERSIÓN FINAL)
 * --------------------------------------------------------------------
 * Este script maneja todas las funcionalidades de la página cambiardatos.jsp:
 * - Carga de datos personales desde la base de datos
 * - Gestión de métodos de pago favoritos
 * - Modificación de la dirección predeterminada
 * - Cambio de contraseña
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando cambiardatos.js - v2.0');
  
  // Cargar los datos del usuario desde el servidor
  loadUserData();
  
  // Cargar los métodos de pago favoritos
  loadPaymentMethods();
  
  // Cargar la dirección predeterminada
  cargarDireccionPredeterminada();
  
  // Manejar pestañas en la URL
  handleTabFromUrl();
});

/**
 * Gestiona las pestañas basadas en parámetros URL
 * Activa la pestaña especificada en el parámetro 'tab' de la URL
 */
function handleTabFromUrl() {
  // Obtener el parámetro 'tab' de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  
  // Si existe el parámetro tab, activar la pestaña correspondiente
  if (tabParam) {
    // Obtener elementos DOM
    const selectedTab = document.getElementById(tabParam + '-tab');
    const selectedPane = document.getElementById(tabParam);
    
    if (selectedTab && selectedPane) {
      // Deseleccionar todas las pestañas
      document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      });
      
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
      });
      
      // Activar la pestaña seleccionada
      selectedTab.classList.add('active');
      selectedTab.setAttribute('aria-selected', 'true');
      selectedPane.classList.add('show', 'active');
      
      // Si hay error o mensaje de éxito, asegurar que sea visible
      const errorMsg = document.querySelector('.alert-danger');
      const successMsg = document.querySelector('.alert-success');
      
      if (errorMsg || successMsg) {
        // Hacer scroll al inicio para mostrar mensajes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
}

/**
* Carga los datos del usuario actual
*/
function loadUserData() {
  // Ya implementado en JSP usando EL (Expression Language)
  console.log('Datos de usuario cargados desde JSP');
}

/**
 * Carga los métodos de pago favoritos del usuario
 */
function loadPaymentMethods() {
  console.log('Cargando métodos de pago favoritos...');
  
  // Elementos DOM que necesitamos gestionar
  const loadingElement = document.getElementById('loading-payment-methods');
  const containerElement = document.getElementById('payment-methods-container');
  const noMethodsElement = document.getElementById('no-payment-methods');
  
  // Asegurarnos de que existen los elementos necesarios
  if (!containerElement) {
    console.warn('Contenedor de métodos de pago no encontrado');
    return;
  }
  
  // Mostrar loader si existe
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
  
  // Limpiar contenedor
  containerElement.innerHTML = '';
  
  // Ocultar mensaje de "sin métodos"
  if (noMethodsElement) noMethodsElement.style.display = 'none';
  
  // Hacer petición al servidor con un parámetro único para evitar caché
  const timestamp = new Date().getTime();
  fetch(`../metodos-pago-servlet?tipo=favoritos&_=${timestamp}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(methods => {
      // Ocultar loader
      if (loadingElement) loadingElement.style.display = 'none';
      
      // Limpiar contenedor
      containerElement.innerHTML = '';
      
      console.log('Métodos de pago recibidos:', methods);
      
      // Si no hay métodos, mostrar mensaje
      if (!methods || methods.length === 0) {
        if (noMethodsElement) {
          noMethodsElement.style.display = 'block';
        } else {
          // Si no existe elemento para "sin métodos", crear uno
          containerElement.innerHTML = `
            <div class="alert alert-info mb-3">
              <i class="fas fa-info-circle"></i> 
              No tienes métodos de pago guardados.
            </div>
          `;
        }
      } else {
        // Ordenar: primero predeterminados, luego por ID descendente
        methods.sort((a, b) => {
          if (a.predeterminado && !b.predeterminado) return -1;
          if (!a.predeterminado && b.predeterminado) return 1;
          return b.id - a.id; // Más recientes primero
        });
        
        // Mostrar cada método de pago
        methods.forEach(method => {
          const methodCard = document.createElement('div');
          methodCard.className = 'payment-method-card';
          methodCard.dataset.id = method.id;
          methodCard.dataset.type = method.metodoPago;
          
          if (method.predeterminado) {
            methodCard.classList.add('default');
          }
          
          // Determinar icono según tipo
          let icon, label;
          switch(method.metodoPago) {
            case 'tarjeta':
              icon = 'fa-credit-card';
              label = 'Tarjeta de crédito';
              break;
            case 'transferencia':
              icon = 'fa-university';
              label = 'Transferencia bancaria';
              break;
            case 'bizum':
              icon = 'fa-mobile-alt';
              label = 'Bizum';
              break;
            case 'contrareembolso':
              icon = 'fa-money-bill-wave';
              label = 'Contra reembolso';
              break;
            default:
              icon = 'fa-credit-card';
              label = method.metodoPago;
          }
          
          // Información adicional para tarjetas
          let additionalInfo = '';
          if (method.metodoPago === 'tarjeta' && method.numeroTarjetaHashed) {
            const lastDigits = method.numeroTarjetaHashed.slice(-4);
            additionalInfo = `<div class="small text-muted">Termina en ${lastDigits}</div>`;
          }
          
          // Badge para el método predeterminado
          const defaultBadge = method.predeterminado ? 
            '<span class="badge badge-primary ml-2">Predeterminado</span>' : '';
          
          methodCard.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas ${icon} fa-lg"></i>
              </div>
              <div>
                <div class="font-weight-bold">${label} ${defaultBadge}</div>
                ${additionalInfo}
              </div>
            </div>
          `;
          
          // Evento click para seleccionar
          methodCard.addEventListener('click', () => {
            // Deseleccionar todos los demás
            document.querySelectorAll('.payment-method-card').forEach(card => {
              card.classList.remove('selected');
            });
            
            // Seleccionar este
            methodCard.classList.add('selected');
            
            // Mostrar formulario de edición
            showEditPaymentForm(method);
          });
          
          containerElement.appendChild(methodCard);
        });
      }
      
      // Añadir opción para nuevo método de pago
      const newMethodCard = document.createElement('div');
      newMethodCard.className = 'payment-method-card payment-method-new';
      newMethodCard.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <i class="fas fa-plus-circle fa-lg"></i>
          </div>
          <div>
            <strong>Usar nuevo método de pago</strong>
          </div>
        </div>
      `;
      
      newMethodCard.addEventListener('click', () => {
        // Deseleccionar todos los métodos
        document.querySelectorAll('.payment-method-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // Seleccionar este método
        newMethodCard.classList.add('selected');
        
        // Mostrar formulario para nuevo método
        showEditPaymentForm(null);
      });
      
      containerElement.appendChild(newMethodCard);
    })
    .catch(error => {
      console.error('Error cargando métodos de pago:', error);
      
      // Ocultar loader
      if (loadingElement) loadingElement.style.display = 'none';
      
      // Mostrar mensaje de error
      containerElement.innerHTML = `
        <div class="alert alert-danger mb-3">
          <i class="fas fa-exclamation-circle"></i> 
          Error al cargar métodos de pago: ${error.message}
        </div>
      `;
      
      // Añadir opción para nuevo método incluso con error
      const newMethodCard = document.createElement('div');
      newMethodCard.className = 'payment-method-card payment-method-new';
      newMethodCard.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="mr-3">
            <i class="fas fa-plus-circle fa-lg"></i>
          </div>
          <div>
            <strong>Usar nuevo método de pago</strong>
          </div>
        </div>
      `;
      
      newMethodCard.addEventListener('click', () => {
        // Deseleccionar todos los métodos
        document.querySelectorAll('.payment-method-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // Seleccionar este método
        newMethodCard.classList.add('selected');
        
        // Mostrar formulario para nuevo método
        showEditPaymentForm(null);
      });
      
      containerElement.appendChild(newMethodCard);
    });
}

/**
 * Muestra el formulario de edición de método de pago
 * @param {Object} method - Método de pago a editar o null para nuevo método
 */
function showEditPaymentForm(method) {
  console.log('showEditPaymentForm llamada con método:', method);
  
  // Elementos DOM principales
  const selectMessage = document.getElementById('select-method-message');
  const editFormContainer = document.getElementById('edit-payment-form');
  const actionsContainer = document.getElementById('payment-actions');
  
  // Verificar elementos necesarios
  if (!selectMessage || !editFormContainer) {
    console.error('Elementos DOM necesarios no encontrados');
    return;
  }
  
  // Ocultar mensaje y mostrar formulario
  selectMessage.style.display = 'none';
  editFormContainer.style.display = 'block';
  
  // CASO 1: NUEVO MÉTODO DE PAGO
  if (method === null) {
    console.log('Creando formulario para NUEVO método de pago');
    
    // Crear formulario HTML
    editFormContainer.innerHTML = `
      <form id="new-payment-form" onsubmit="return false;">
        <div class="form-group">
          <label for="new-payment-type">Método de pago</label>
          <select class="form-control" id="new-payment-type" name="new-payment-type">
            <option value="tarjeta">Tarjeta de crédito</option>
            <option value="transferencia">Transferencia bancaria</option>
            <option value="bizum">Bizum</option>
            <option value="contrareembolso">Contra reembolso</option>
          </select>
        </div>
        
        <div id="card-fields" class="form-group">
          <label for="new-card-number">Número de tarjeta</label>
          <input type="text" class="form-control" id="new-card-number" name="new-card-number" 
                 placeholder="Ingrese el número completo de la tarjeta" 
                 maxlength="16" pattern="[0-9]{16}">
          <small class="form-text text-muted">Debe ingresar los 16 dígitos sin espacios</small>
        </div>
        
        <div class="form-check mb-3">
          <input type="checkbox" class="form-check-input" id="set-as-default" name="set-as-default">
          <label class="form-check-label" for="set-as-default">
            Establecer como método predeterminado
          </label>
        </div>
        
        <div class="form-group mt-4">
          <button type="button" id="btn-save-new-payment" class="btn btn-primary">Guardar</button>
          <button type="button" id="cancel-new-payment" class="btn btn-secondary ml-2">Cancelar</button>
        </div>
      </form>
    `;
    
    // Ocultar acciones adicionales
    if (actionsContainer) actionsContainer.style.display = 'none';
    
    // Configurar elementos
    const newPaymentType = document.getElementById('new-payment-type');
    const cardFields = document.getElementById('card-fields');
    const saveBtn = document.getElementById('btn-save-new-payment');
    const cancelBtn = document.getElementById('cancel-new-payment');
    
    // Mostrar/ocultar campos según tipo
    if (newPaymentType) {
      newPaymentType.addEventListener('change', function() {
        if (cardFields) {
          cardFields.style.display = this.value === 'tarjeta' ? 'block' : 'none';
        }
      });
    }
    
    // Cancelar
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        editFormContainer.style.display = 'none';
        selectMessage.style.display = 'block';
        document.querySelectorAll('.payment-method-card').forEach(el => {
          el.classList.remove('selected');
        });
      });
    }
    
    // Guardar
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        const tipo = newPaymentType.value;
        const setPredetermined = document.getElementById('set-as-default')?.checked || false;
        
        // Datos para el servidor
        const paymentData = {
          operacion: 'guardar_preferencia',
          metodoPago: tipo,
          predeterminado: setPredetermined
        };
        
        // Si es tarjeta, validar y agregar número
        if (tipo === 'tarjeta') {
          const cardNumber = document.getElementById('new-card-number').value.trim();
          
          if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            // Mostrar error
            if (typeof Notify !== 'undefined' && typeof Notify.warning === 'function') {
              Notify.warning('Por favor, ingrese un número de tarjeta válido de 16 dígitos');
            } else {
              alert('Por favor, ingrese un número de tarjeta válido de 16 dígitos');
            }
            return;
          }
          
          paymentData.numeroTarjeta = cardNumber;
        }
        
        console.log('Enviando datos al servidor:', paymentData);
        
        // Enviar al servidor
        sendPaymentDataToServer(paymentData);
      });
    }
  }
  // CASO 2: EDITAR MÉTODO EXISTENTE
  else {
    console.log('Creando formulario para EDITAR método existente:', method);
    
    // Limpiar elementos previos si existen
    editFormContainer.innerHTML = '';
    
    // Crear formulario HTML para edición
    editFormContainer.innerHTML = `
      <form id="edit-payment-form-inner" onsubmit="return false;">
        <input type="hidden" id="edit-payment-id" name="edit-payment-id" value="${method.id || 0}">
        <div class="form-group">
          <label for="edit-payment-type">Método de pago</label>
          <select class="form-control" id="edit-payment-type" name="edit-payment-type">
            <option value="tarjeta" ${method.metodoPago === 'tarjeta' ? 'selected' : ''}>Tarjeta de crédito</option>
            <option value="transferencia" ${method.metodoPago === 'transferencia' ? 'selected' : ''}>Transferencia bancaria</option>
            <option value="bizum" ${method.metodoPago === 'bizum' ? 'selected' : ''}>Bizum</option>
            <option value="contrareembolso" ${method.metodoPago === 'contrareembolso' ? 'selected' : ''}>Contra reembolso</option>
          </select>
        </div>
        
        <div id="edit-card-fields" class="form-group" style="display: ${method.metodoPago === 'tarjeta' ? 'block' : 'none'}">
          <label for="edit-card-number">Número de tarjeta</label>
          <input type="text" class="form-control" id="edit-card-number" name="edit-card-number" 
                 placeholder="Ingrese el nuevo número de tarjeta"
                 maxlength="16" pattern="[0-9]{16}">
          <small class="text-muted">Dejar vacío para mantener la tarjeta actual</small>
        </div>
        
        <div class="form-group mt-4">
          <button type="button" id="btn-update-payment" class="btn btn-primary">Guardar cambios</button>
          <button type="button" id="cancel-edit-payment" class="btn btn-secondary ml-2">Cancelar</button>
        </div>
      </form>
    `;
    
    // Mostrar acciones adicionales
    if (actionsContainer) {
      actionsContainer.style.display = 'block';
      
      // Configurar botones
      const btnDefault = document.getElementById('btn-set-default');
      const btnDelete = document.getElementById('btn-delete-payment');
      
      // Deshabilitar botón predeterminado si ya lo es
      if (btnDefault) {
        btnDefault.disabled = method.predeterminado;
        
        // Quitar eventos previos
        const newBtnDefault = btnDefault.cloneNode(true);
        btnDefault.parentNode.replaceChild(newBtnDefault, btnDefault);
        
        // Añadir evento click
        newBtnDefault.addEventListener('click', function() {
          if (confirm('¿Establecer este método como predeterminado?')) {
            const setDefaultData = {
              operacion: 'establecer_predeterminado',
              id: method.id
            };
            sendPaymentDataToServer(setDefaultData);
          }
        });
      }
      
      // Configurar botón eliminar
      if (btnDelete) {
        // Quitar eventos previos
        const newBtnDelete = btnDelete.cloneNode(true);
        btnDelete.parentNode.replaceChild(newBtnDelete, btnDelete);
        
        // Añadir evento click
        newBtnDelete.addEventListener('click', function() {
          if (confirm('¿Eliminar este método de pago?')) {
            const deleteData = {
              operacion: 'eliminar',
              id: method.id
            };
            sendPaymentDataToServer(deleteData);
          }
        });
      }
    }
    
    // Configurar eventos del formulario
    const editPaymentType = document.getElementById('edit-payment-type');
    const editCardFields = document.getElementById('edit-card-fields');
    const updateBtn = document.getElementById('btn-update-payment');
    const cancelEditBtn = document.getElementById('cancel-edit-payment');
    
    // Mostrar/ocultar campos de tarjeta
    if (editPaymentType && editCardFields) {
      editPaymentType.addEventListener('change', function() {
        editCardFields.style.display = this.value === 'tarjeta' ? 'block' : 'none';
      });
    }
    
    // Evento del botón actualizar
    if (updateBtn) {
      updateBtn.addEventListener('click', function() {
        const tipo = editPaymentType.value;
        const methodId = document.getElementById('edit-payment-id').value;
        
        // Datos para el servidor
        const updateData = {
          operacion: 'actualizar',
          pagoId: methodId,
          metodoPago: tipo
        };
        
        // Si es tarjeta y se ha ingresado un nuevo número
        if (tipo === 'tarjeta') {
          const cardNumber = document.getElementById('edit-card-number').value.trim();
          
          if (cardNumber) {
            if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
              // Mostrar error
              if (typeof Notify !== 'undefined' && typeof Notify.warning === 'function') {
                Notify.warning('Por favor, ingrese un número de tarjeta válido de 16 dígitos');
              } else {
                alert('Por favor, ingrese un número de tarjeta válido de 16 dígitos');
              }
              return;
            }
            
            updateData.numeroTarjeta = cardNumber;
          }
        }
        
        console.log('Enviando actualización:', updateData);
        
        // Enviar al servidor
        sendPaymentDataToServer(updateData);
      });
    }
    
    // Evento cancelar
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', function() {
        editFormContainer.style.display = 'none';
        selectMessage.style.display = 'block';
        if (actionsContainer) actionsContainer.style.display = 'none';
        
        // Deseleccionar todos los métodos
        document.querySelectorAll('.payment-method-card').forEach(el => {
          el.classList.remove('selected');
        });
      });
    }
  }
}

/**
 * Envía datos del método de pago al servidor
 * @param {Object} data - Datos a enviar
 */
function sendPaymentDataToServer(data) {
  // Mostrar indicador de carga si existe Notify
  if (typeof Notify !== 'undefined' && typeof Notify.info === 'function') {
    Notify.info('Procesando...');
  }
  
  // Enviar datos al servidor
  fetch('../metodos-pago-servlet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then(result => {
    if (result.success) {
      // Mostrar mensaje de éxito
      if (typeof Notify !== 'undefined' && typeof Notify.success === 'function') {
        Notify.success(result.message || 'Operación completada con éxito');
      } else {
        alert(result.message || 'Operación completada con éxito');
      }
      
      // Recargar métodos de pago después de un breve retraso
      setTimeout(() => {
        // Ocultar formulario y acciones
        const editForm = document.getElementById('edit-payment-form');
        const selectMessage = document.getElementById('select-method-message');
        const actions = document.getElementById('payment-actions');
        
        if (editForm) editForm.style.display = 'none';
        if (selectMessage) selectMessage.style.display = 'block';
        if (actions) actions.style.display = 'none';
        
        // Recargar métodos
        loadPaymentMethods();
      }, 500);
    } else {
      // Mostrar error
      if (typeof Notify !== 'undefined' && typeof Notify.error === 'function') {
        Notify.error(result.error || 'Error al procesar la solicitud');
      } else {
        alert(result.error || 'Error al procesar la solicitud');
      }
    }
  })
  .catch(error => {
    console.error('Error en sendPaymentDataToServer:', error);
    
    // Mostrar error
    if (typeof Notify !== 'undefined' && typeof Notify.error === 'function') {
      Notify.error('Error al procesar la solicitud: ' + error.message);
    } else {
      alert('Error al procesar la solicitud: ' + error.message);
    }
  });
}

/**
* Carga la dirección predeterminada desde el servidor
*/
function cargarDireccionPredeterminada() {
  fetch('../direccion-predeterminada-servlet?accion=obtener')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener dirección predeterminada');
      }
      return response.json();
    })
    .then(direccion => {
      if (direccion && direccion.domicilio) {
        // Si tenemos dirección predeterminada, la cargamos en el formulario
        document.getElementById('defaultAddress').value = direccion.domicilio || '';
        document.getElementById('defaultCity').value = direccion.poblacion || '';
        document.getElementById('defaultProvince').value = direccion.provincia || '';
        document.getElementById('defaultZip').value = direccion.cp || '';
        document.getElementById('defaultPhone').value = direccion.telefono || '';
      }
    })
    .catch(error => {
      console.error('Error al cargar dirección predeterminada:', error);
    });
}