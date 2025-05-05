/**
 * notifications.js - actualizado con sistema i18n centralizado
 * -----------------------------------
 * Sistema centralizado de notificaciones no intrusivas para reemplazar alerts
 * Proporciona toast notifications para mostrar mensajes al usuario
 * sin interrumpir el flujo de la aplicación.
 */

// Namespace para el sistema de notificaciones
window.Notify = {
  /**
   * Muestra una notificación tipo toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duración en milisegundos (por defecto 3000ms)
   */
  toast: function(message, type = 'success', duration = 3000) {
    // Crear o recuperar el contenedor de notificaciones
    let container = document.getElementById('toast-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    
    // Crear la notificación
    const notification = document.createElement('div');
    notification.className = `toast toast-${type}`;
    
    // Seleccionar icono según el tipo
    let icon;
    switch (type) {
      case 'success':
        icon = 'fa-check-circle';
        break;
      case 'error':
        icon = 'fa-times-circle';
        break;
      case 'warning':
        icon = 'fa-exclamation-triangle';
        break;
      case 'info':
      default:
        icon = 'fa-info-circle';
    }
    
    // Construir el contenido
    notification.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="toast-content">${message}</div>
      <button class="toast-close">&times;</button>
    `;
    
    // Añadir al contenedor
    container.appendChild(notification);
    
    // Efecto de aparición
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Cerrar al hacer clic en el botón
    const closeBtn = notification.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      });
    }
    
    // Auto-cerrar después de la duración especificada
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
  },
  
  /**
   * Muestra una notificación de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en milisegundos (por defecto 3000ms)
   */
  success: function(message, duration = 3000) {
    this.toast(message, 'success', duration);
  },
  
  /**
   * Muestra una notificación de error
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en milisegundos (por defecto 3000ms)
   */
  error: function(message, duration = 3000) {
    this.toast(message, 'error', duration);
  },
  
  /**
   * Muestra una notificación de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en milisegundos (por defecto 3000ms)
   */
  warning: function(message, duration = 3000) {
    this.toast(message, 'warning', duration);
  },
  
  /**
   * Muestra una notificación informativa
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en milisegundos (por defecto 3000ms)
   */
  info: function(message, duration = 3000) {
    this.toast(message, 'info', duration);
  }
};

// Estilos CSS para las notificaciones
document.addEventListener('DOMContentLoaded', function() {
  // Solo añadir estilos si no existen ya
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `...`;
    document.head.appendChild(style);
  }
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    // Las notificaciones son efímeras, no necesitamos hacer nada aquí
    // ya que las nuevas notificaciones usarán automáticamente las nuevas traducciones
  });
});

// Sustitución de la función alert estándar
window.originalAlert = window.alert;
window.alert = function(message) {
  if (window.Notify) {
    window.Notify.info(message);
  } else {
    window.Notify.info(message);
  }
};