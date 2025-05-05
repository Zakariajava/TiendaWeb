// dark-mode.js - actualizado con sistema i18n centralizado
// Script para gestionar el modo oscuro de la aplicación

/**
 * Función para verificar y aplicar el modo oscuro
 * Comprueba localStorage y actualiza elementos visuales
 */
function checkDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Aplicar clase al body
  document.body.classList.toggle('dark-mode', isDarkMode);
  
  // Actualizar iconos
  const darkIcon = document.getElementById('darkModeIcon');
  const lightIcon = document.getElementById('lightModeIcon');
  
  if (darkIcon && lightIcon) {
    darkIcon.style.display = isDarkMode ? 'none' : 'inline';
    lightIcon.style.display = isDarkMode ? 'inline' : 'none';
  }
  
  // Actualizar atributos aria para accesibilidad
  const toggleBtn = document.getElementById('toggleDarkMode');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', isDarkMode);
    toggleBtn.setAttribute('title', isDarkMode ? 
      getI18nMessage('darkMode.switchToLight') : 
      getI18nMessage('darkMode.switchToDark'));
  }
}

/**
 * Inicialización del modo oscuro cuando el DOM está cargado
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleDarkMode');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentMode = localStorage.getItem('darkMode') === 'true';
      localStorage.setItem('darkMode', !currentMode);
      checkDarkMode();
    });
  }
  
  // Verificar modo al cargar la página
  checkDarkMode();
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', () => {
    // Actualizar título del botón con el nuevo idioma
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const toggleBtn = document.getElementById('toggleDarkMode');
    if (toggleBtn) {
      toggleBtn.setAttribute('title', isDarkMode ? 
        getI18nMessage('darkMode.switchToLight') : 
        getI18nMessage('darkMode.switchToDark'));
    }
  });
});