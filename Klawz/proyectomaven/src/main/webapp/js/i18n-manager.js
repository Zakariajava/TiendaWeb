/**
 * i18n-manager.js
 * -----------------------------------
 * Sistema centralizado de internacionalización para la aplicación.
 * Gestiona traducciones y cambios de idioma.
 * 
 * Este sistema recibe las traducciones de translations.jsp que carga
 * automáticamente TODAS las traducciones del ResourceBundle actual.
 */

// Namespace global para traducciones
window.i18n = {
    // El idioma actual
    currentLang: '',
    
    // Almacén para traducciones cargadas desde translations.jsp
    translations: {},
    
    // Bandera para saber si ya está inicializado
    initialized: false,
    
    /**
     * Método principal para obtener una traducción
     * @param {string} key - Clave de traducción a buscar
     * @param {Object} params - Parámetros a sustituir en la traducción (opcional)
     * @returns {string} - Texto traducido o la clave original si no se encuentra
     */
    get: function(key, params) {
        if (!key) return '';
        
        // Buscar primero en las traducciones cargadas
        let text = this.translations[key] || key;
        
        // Reemplazar parámetros si existen
        if (params) {
            Object.keys(params).forEach(param => {
                const regex = new RegExp(`\\{${param}\\}`, 'g'); // CORREGIDO - escapa { y }
                text = text.replace(regex, params[param]);
            });
        }
        
        return text;
    },
    
    /**
     * Carga traducciones en el sistema desde un objeto
     * @param {Object} newTranslations - Objeto con nuevas traducciones
     */
    load: function(newTranslations) {
        this.translations = {...this.translations, ...newTranslations};
    },
    
    /**
     * Inicializa el sistema de traducciones con los datos de window.translations
     * que es generado por translations.jsp
     */
    init: function() {
        // Evitar inicialización múltiple
        if (this.initialized) {
            console.info('i18n system already initialized');
            return;
        }
        
        try {
            // Obtener el idioma actual
            this.currentLang = window.currentLanguage || document.documentElement.lang || 'es';
            
            // Cargar traducciones iniciales desde window.translations
            if (window.translations) {
                this.translations = {...window.translations};
                console.info('Translations loaded from window.translations:', Object.keys(this.translations).length);
            } else {
                console.warn('window.translations not defined or empty! Translation system will not work correctly.');
                // Intentar obtener traducciones una vez más después de un breve retraso
                setTimeout(() => {
                    if (window.translations && Object.keys(window.translations).length > 0) {
                        this.translations = {...window.translations};
                        this.updateDOMElements();
                        console.info('Translations loaded on retry:', Object.keys(this.translations).length);
                    }
                }, 500);
            }
            
            // Configurar dirección para árabe
            if (this.currentLang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
                document.body.classList.add('rtl');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
                document.body.classList.remove('rtl');
            }
            
            // Actualizar elementos automáticamente
            this.updateDOMElements();
            
            // Escuchar al selector de idioma
            this.setupLanguageSelector();
            
            console.info('i18n system initialized with language:', this.currentLang, 'with', Object.keys(this.translations).length, 'translations');
            
            // Marcar como inicializado
            this.initialized = true;
            
            // Disparar evento para que los componentes puedan reaccionar
            document.dispatchEvent(new CustomEvent('i18nInitialized'));
        } catch (e) {
            console.error('Error initializing i18n system:', e);
        }
    },
    
    /**
     * Actualiza elementos del DOM que tengan atributos data-i18n
     */
    updateDOMElements: function() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.get(key);
        });
    },
    
    /**
     * Establece un nuevo idioma
     * @param {string} lang - Código de idioma (es, en, fr, de, ar)
     */
    setLanguage: function(lang) {
        this.currentLang = lang;
        
        // Configurar dirección para árabe
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
        
        // Actualizar elementos
        this.updateDOMElements();
        
        // Disparar evento para que los componentes puedan reaccionar
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },
    
    /**
     * Configura el selector de idioma
     */
    setupLanguageSelector: function() {
        document.addEventListener('DOMContentLoaded', () => {
            const langSelector = document.getElementById('language-dropdown');
            if (langSelector) {
                langSelector.addEventListener('change', function() {
                    const selectedLang = this.value;
                    if (selectedLang) {
                        // La navegación real la maneja el servidor
                        // Pero actualizamos la UI hasta la recarga
                        window.i18n.setLanguage(selectedLang);
                    }
                });
            }
        });
    }
};

/**
 * Función global para obtener traducción - Compatible con el código existente
 * Esta función es la única forma de acceder a las traducciones desde JavaScript
 * @param {string} key - Clave de traducción
 * @param {Object} params - Parámetros para sustitución (opcional)
 * @returns {string} Texto traducido
 */
window.getI18nMessage = function(key, params) {
    return window.i18n.get(key, params);
};

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Dar un pequeño retraso para asegurar que window.translations esté cargado
    setTimeout(() => {
        if (!window.i18n.initialized) {
            window.i18n.init();
        }
    }, 10);
});