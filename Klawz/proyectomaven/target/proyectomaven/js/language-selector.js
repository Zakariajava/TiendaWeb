/**
 * language-selector.js - actualizado con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script encargado de gestionar el selector de idiomas.
 * - Maneja el cambio de idioma cuando el usuario selecciona un nuevo idioma.
 * - Redirige a la página de cambio de idioma con los parámetros adecuados.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Manejar el cambio de idioma
  const languageDropdown = document.getElementById('language-dropdown');
  if (languageDropdown) {
    // Añadir etiquetas de texto para accesibilidad
    const labelText = window.getI18nMessage ? 
      getI18nMessage('language.select') : 
      'Seleccionar idioma';
    
    // Añadir atributos de accesibilidad
    languageDropdown.setAttribute('aria-label', labelText);
    languageDropdown.setAttribute('title', labelText);
    
    // Manejar el cambio de idioma
    languageDropdown.addEventListener('change', function() {
      const selectedLang = this.value;
      if (selectedLang) {
        // Construir la URL para el cambio de idioma
        window.location.href = `${langContextPath}/cambiar-idioma?lang=${selectedLang}&redirect=${langCurrentPage}`;
      }
    });
  }
});