/**
 * gestionpedidos.js - actualizado con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script que gestiona la vista de pedidos del usuario.
 * 
 * - Al cargarse la página, realiza una petición al servlet
 *   `pedido-servlet?extended=true` para obtener todos los pedidos con IDs de detalles.
 * - Renderiza cada pedido con sus detalles, mostrando "Cancelado" para productos ya cancelados.
 * - Permite cancelar pedidos completos o productos individuales
 *   si están en estado "pendiente" y no cancelados previamente.
 */

// Variable global para almacenar los pedidos con datos extendidos
let pedidosData = [];

/**
 * Traduce el estado del pedido
 * @param {string} estado - Estado original (pendiente, enviado, entregado, cancelado)
 * @returns {string} Estado traducido
 */
function traducirEstado(estado) {
  // Mapeo de estados originales a claves de traducción
  const estadoMapping = {
    'pendiente': 'orders.status.pending',
    'enviado': 'orders.status.shipped',
    'entregado': 'orders.status.delivered',
    'cancelado': 'orders.status.cancelled'
  };
  
  // Obtener la clave de traducción o usar el estado original como fallback
  const clave = estadoMapping[estado] || estado;
  
  // Traducir usando la clave
  return getI18nMessage(clave);
}

/**
 * Evento principal que se ejecuta al cargar el DOM.
 * - Consulta los pedidos mediante una petición fetch.
 * - Si el usuario no está logueado, redirige a login.jsp.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Cargar los pedidos mediante AJAX con parámetro extended=true
  fetchPedidosExtendidos();
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    renderPedidosModernos(pedidosData);
  });
});

/**
 * Realiza la petición AJAX para obtener los pedidos extendidos
 */
function fetchPedidosExtendidos() {
  // Usar extended=true para obtener los IDs de los detalles
  fetch(`${window.location.origin}/proyectomaven/pedido-servlet?extended=true`)
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "login.jsp"; // Redirige si no autorizado
        }
        throw new Error(`Error HTTP: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      pedidosData = data;
      renderPedidosModernos(data);
    })
    .catch(err => {
      console.error("Error al cargar pedidos:", err);
      document.getElementById("orders-container").innerHTML = 
        `<div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> ${getI18nMessage('orders.loadError')}
        </div>`;
    });
}

/**
 * Renderiza todos los pedidos con un diseño moderno y minimalista
 * @param {Array} pedidos - Lista de pedidos con sus detalles
 */
function renderPedidosModernos(pedidos) {
  const container = document.getElementById("orders-container");
  
  // Si no hay pedidos, mostrar mensaje
  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = `
      <div class="text-center p-5">
        <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
        <h4>${getI18nMessage('orders.noOrders')}</h4>
        <p class="text-muted">${getI18nMessage('orders.noOrders')}</p>
        <a href="shop.jsp" class="btn btn-outline-primary">${getI18nMessage('nav.shop')}</a>
      </div>`;
    return;
  }

  // Contenedor para todos los pedidos
  let html = '<div class="pedidos-container">';
  
  // Iterar por cada pedido
  pedidos.forEach(pedido => {
    const fecha = new Date(pedido.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Determinar la clase CSS basada en el estado
    let estadoClass = 'badge-secondary';
    if (pedido.estado === 'pendiente') estadoClass = 'badge-warning';
    if (pedido.estado === 'enviado') estadoClass = 'badge-primary';
    if (pedido.estado === 'entregado') estadoClass = 'badge-success';
    if (pedido.estado === 'cancelado') estadoClass = 'badge-danger';
    
    // Calcular subtotal (solo de productos activos)
    let subtotal = 0;
    pedido.detalles.forEach(d => {
      // Si el detalle tiene estado y está activo, sumarlo al subtotal
      if (!d.estado || d.estado === 'activo') {
        subtotal += d.cantidad * d.precio;
      }
    });
    
    // Iniciar card de pedido
    html += `
      <div class="card shadow-sm mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted">#${pedido.id}</span>
            <span class="badge ${estadoClass} ml-2">${traducirEstado(pedido.estado)}</span>
          </div>
          <div>
            <i class="far fa-clock"></i> ${fecha}
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead class="thead-light">
                <tr>
                  <th>${getI18nMessage('orders.product')}</th>
                  <th class="text-center">${getI18nMessage('orders.quantity')}</th>
                  <th class="text-right">${getI18nMessage('orders.price')}</th>
                  <th class="text-right">${getI18nMessage('orders.subtotal')}</th>
                  ${pedido.estado === 'pendiente' ? `<th>${getI18nMessage('orders.state')}</th>` : ''}
                </tr>
              </thead>
              <tbody>`;
    
    // Agregar cada detalle del pedido
    pedido.detalles.forEach(detalle => {
      const subtotalProducto = detalle.cantidad * detalle.precio;
      
      // Determinar si el detalle está cancelado o activo
      const estaProductoCancelado = detalle.estado === 'cancelado';
      const filaClass = estaProductoCancelado ? 'text-muted' : '';
      
      html += `
        <tr class="${filaClass}">
          <td>${detalle.nombreProducto}</td>
          <td class="text-center">${detalle.cantidad}</td>
          <td class="text-right">${detalle.precio.toFixed(2)} €</td>
          <td class="text-right">${subtotalProducto.toFixed(2)} €</td>`;
      
      // Columna de acciones/estado (solo para pedidos pendientes)
      if (pedido.estado === 'pendiente') {
        if (estaProductoCancelado) {
          // Si el producto ya está cancelado, mostrar badge en lugar de botón
          html += `
            <td>
              <span class="badge badge-danger">${getI18nMessage('orders.status.cancelled')}</span>
            </td>`;
        } else {
          // Si está activo, mostrar botón de cancelar
          html += `
            <td>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="cancelarProductoPedido(${pedido.id}, ${detalle.id}, '${detalle.nombreProducto}')"><i class="fas fa-times"></i> ${getI18nMessage('orders.cancel')}</button>
            </td>`;
        }
      }
      
      html += `</tr>`;
    });
    
    // Cerrar la tabla y agregar el total
    html += `
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="${pedido.estado === 'pendiente' ? '3' : '3'}" class="text-right">${getI18nMessage('orders.total')}:</th>
                  <th class="text-right">${subtotal.toFixed(2)} €</th>
                  ${pedido.estado === 'pendiente' ? '<td></td>' : ''}
                </tr>
              </tfoot>
            </table>
          </div>`;
    
    // Agregar botón de cancelar pedido completo (solo si está pendiente y hay productos activos)
    if (pedido.estado === 'pendiente' && pedido.detalles.some(d => !d.estado || d.estado === 'activo')) {
      html += `
        <div class="text-right mt-3">
          <button class="btn btn-danger" onclick="cancelarPedidoCompleto(${pedido.id})"><i class="fas fa-ban"></i> ${getI18nMessage('orders.cancelComplete')}</button>
        </div>`;
    }
    
    // Cerrar la card del pedido
    html += `
        </div>
      </div>`;
  });
  
  // Cerrar el contenedor principal
  html += '</div>';
  
  // Insertar en el DOM
  container.innerHTML = html;
}

/**
 * Cancela un pedido completo
 * @param {number} pedidoId - ID del pedido a cancelar
 */

// 1. Función para el modal de confirmación personalizado
function confirmarAccion(mensaje, callback) {
  // Crear el modal
  const modalId = 'modal-confirm-' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="custom-modal-content">
      <div class="custom-modal-header">
        <h5>${getI18nMessage('orders.confirmTitle') || 'Confirmar acción'}</h5>
        <button type="button" class="close-btn">&times;</button>
      </div>
      <div class="custom-modal-body">
        <p>${mensaje}</p>
      </div>
      <div class="custom-modal-footer">
        <button type="button" class="btn btn-secondary cancel-btn">${getI18nMessage('general.cancel') || 'Cancelar'}</button>
        <button type="button" class="btn btn-danger confirm-btn">${getI18nMessage('general.confirm') || 'Confirmar'}</button>
      </div>
    </div>
  `;
  
  // Añadir el modal al cuerpo del documento
  document.body.appendChild(modal);
  
  // Mostrar el modal con transición
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Configurar eventos
  const closeHandler = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  };
  
  const confirmHandler = () => {
    closeHandler();
    if (typeof callback === 'function') {
      callback();
    }
  };
  
  // Asignar eventos
  modal.querySelector('.close-btn').addEventListener('click', closeHandler);
  modal.querySelector('.cancel-btn').addEventListener('click', closeHandler);
  modal.querySelector('.confirm-btn').addEventListener('click', confirmHandler);
  
  // Cerrar si se hace clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeHandler();
    }
  });
}

function cancelarPedidoCompleto(pedidoId) {
  confirmarAccion(getI18nMessage('orders.confirmCancel'), function() {
    fetch(`${window.location.origin}/proyectomaven/cancelar-pedido`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `pedidoId=${encodeURIComponent(pedidoId)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Mostrar mensaje de éxito y recargar los pedidos
        const container = document.getElementById("orders-container");
        container.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i class="fas fa-check-circle"></i> ${getI18nMessage('success.cancelOrder')}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>` + container.innerHTML;
        
        // Actualizar los datos
        fetchPedidosExtendidos();
      } else {
        Notify.error(getI18nMessage('error.generalError'));
      }
    })
    .catch(err => {
      console.error("Error al cancelar pedido:", err);
      Notify.error(getI18nMessage('error.generalError'));
    });
  });
}

/**
 * Cancela un producto específico dentro de un pedido
 * @param {number} pedidoId - ID del pedido
 * @param {number} detalleId - ID del detalle a cancelar
 * @param {string} nombreProducto - Nombre del producto para la confirmación
 */
function cancelarProductoPedido(pedidoId, detalleId, nombreProducto) {
  // Verificar que los parámetros son válidos
  if (!pedidoId || !detalleId) {
    console.error("Error: Parámetros inválidos - pedidoId:", pedidoId, "detalleId:", detalleId);
    Notify.error(getI18nMessage('error.generalError'));
    return;
  }
  
  // Usar el modal personalizado en lugar de confirm()
  confirmarAccion(`${getI18nMessage('orders.confirmCancelProduct')} "${nombreProducto}"?`, function() {
    // Depuración - Mostrar los valores que se enviarán
    console.log("Enviando cancelación - pedidoId:", pedidoId, "detalleId:", detalleId);
    
    // Crear FormData con los parámetros
    const params = new URLSearchParams();
    params.append('pedidoId', pedidoId);
    params.append('detalleId', detalleId);
    
    // Mostrar parámetros para depuración
    console.log("Cadena de parámetros:", params.toString());
    
    // Mostrar indicador de carga
    const container = document.getElementById("orders-container");
    const loadingId = 'loading-cancel-' + Date.now();
    const loadingHtml = `
      <div id="${loadingId}" class="alert alert-info alert-dismissible fade show mb-4" role="alert">
        <i class="fas fa-spinner fa-spin"></i> ${getI18nMessage('orders.loading')}...
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`;
    container.innerHTML = loadingHtml + container.innerHTML;

    // Hacer la petición fetch
    fetch(`${window.location.origin}/proyectomaven/cancelar-detalle-pedido`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    })
    .then(res => {
      // Eliminar indicador de carga
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) loadingElement.remove();
      
      // Log de respuesta para depuración
      console.log("Respuesta del servidor:", res.status, res.statusText);
      
      // Verificar si la respuesta es correcta
      if (!res.ok) {
        return res.text().then(text => {
          console.error("Detalle de error:", text);
          throw new Error(`Error HTTP: ${res.status} - ${text || res.statusText}`);
        });
      }
      
      // Intentar procesar como JSON
      return res.text().then(text => {
        console.log("Texto de respuesta:", text);
        if (!text) {
          return { success: false, error: getI18nMessage('error.generalError') };
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("Error al parsear JSON:", e);
          return { success: false, error: getI18nMessage('error.generalError') };
        }
      });
    })
    .then(data => {
      console.log("Datos de respuesta:", data);
      
      if (data.success) {
        // Mostrar mensaje de éxito
        container.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i class="fas fa-check-circle"></i> ${getI18nMessage('success.cancelProduct')}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>` + container.innerHTML;
        
        // Actualizar datos de pedidos
        fetchPedidosExtendidos();
      } else {
        // Mostrar mensaje de error
        container.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i class="fas fa-exclamation-circle"></i> ${getI18nMessage('error.generalError')} ${data.error || ''}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>` + container.innerHTML;
      }
    })
    .catch(err => {
      // Registrar error completo en consola
      console.error("Error completo al cancelar producto del pedido:", err);
      
      // Mostrar mensaje de error al usuario
      container.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i class="fas fa-exclamation-circle"></i> ${getI18nMessage('error.generalError')} ${err.message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>` + container.innerHTML;
    });
  });
}