package tienda;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Locale;
import java.util.ResourceBundle;
import java.util.MissingResourceException;
import java.util.logging.Logger;
import java.util.logging.Level;

/**
 * Clase LanguageUtil
 * --------------------------------------------------------------
 * Clase utilitaria para la gestión de la internacionalización.
 * Proporciona métodos para obtener el idioma actual, cambiar el idioma
 * y obtener los mensajes traducidos según el idioma seleccionado.
 */
public class LanguageUtil {
    // Añado logger para debugging
    private static final Logger LOGGER = Logger.getLogger(LanguageUtil.class.getName());

    /** Nombre del parámetro de sesión donde se almacena el idioma */
    private static final String SESSION_LANGUAGE = "userLanguage";

    /** Idioma por defecto */
    private static final String DEFAULT_LANGUAGE = "es";

    /** Idiomas soportados */
    private static final String[] SUPPORTED_LANGUAGES = { "es", "en", "fr", "de", "ar", "ber", "chi" };

    /** Base de los recursos de mensajes */
    private static final String RESOURCE_BASE = "tienda.messages";

    /**
     * Obtiene el idioma actual del usuario, ya sea desde la sesión,
     * desde las preferencias del navegador o el idioma por defecto.
     * 
     * @param request Petición HTTP
     * @return Locale con el idioma seleccionado
     */
    public static Locale getCurrentLocale(HttpServletRequest request) {
        HttpSession session = request.getSession();
        String lang = (String) session.getAttribute(SESSION_LANGUAGE);

        // Si no hay idioma en sesión, intentar obtenerlo de las cabeceras
        // Accept-Language
        if (lang == null) {
            lang = getBrowserLanguage(request);
            session.setAttribute(SESSION_LANGUAGE, lang);
            LOGGER.info("Idioma establecido por primera vez: " + lang);
        } else {
            LOGGER.info("Idioma recuperado de sesión: " + lang);
        }

        return Locale.forLanguageTag(lang);
    }

    /**
     * Obtiene el idioma desde las cabeceras Accept-Language del navegador.
     * Si no está entre los idiomas soportados, devuelve el idioma por defecto.
     * 
     * @param request Petición HTTP
     * @return Código de idioma soportado
     */
    private static String getBrowserLanguage(HttpServletRequest request) {
        Locale browserLocale = request.getLocale();
        String browserLang = browserLocale.getLanguage();

        LOGGER.info("Idioma del navegador detectado: " + browserLang);

        // Verificar si es un idioma soportado
        for (String supported : SUPPORTED_LANGUAGES) {
            if (supported.equals(browserLang)) {
                return browserLang;
            }
        }

        // Si no está entre los soportados, devolver el idioma por defecto
        LOGGER.info("Usando idioma por defecto: " + DEFAULT_LANGUAGE);
        return DEFAULT_LANGUAGE;
    }

    /**
     * Cambia el idioma de la sesión.
     * 
     * @param request Petición HTTP
     * @param lang    Nuevo idioma (debe estar entre los soportados)
     * @return true si se ha cambiado correctamente, false si el idioma no es
     *         soportado
     */
    public static boolean setLanguage(HttpServletRequest request, String lang) {
        // Verificar si es un idioma soportado
        boolean isSupported = false;
        for (String supported : SUPPORTED_LANGUAGES) {
            if (supported.equals(lang)) {
                isSupported = true;
                break;
            }
        }

        if (!isSupported) {
            LOGGER.warning("Intento de establecer idioma no soportado: " + lang);
            return false;
        }

        // Establecer el idioma en la sesión
        HttpSession session = request.getSession();
        session.setAttribute(SESSION_LANGUAGE, lang);
        LOGGER.info("Idioma cambiado correctamente a: " + lang);
        return true;
    }

    /**
     * Obtiene un mensaje traducido según el idioma actual.
     * 
     * @param request Petición HTTP
     * @param key     Clave del mensaje
     * @return Mensaje traducido, o la clave si no se encuentra el mensaje
     */
    public static String getMessage(HttpServletRequest request, String key) {
        if (key == null || key.isEmpty()) {
            LOGGER.warning("Se solicitó una clave nula o vacía");
            return "";
        }

        Locale locale = getCurrentLocale(request);
        ResourceBundle bundle = null;

        try {
            LOGGER.fine("Buscando recurso para locale: " + locale + ", clave: " + key);
            bundle = ResourceBundle.getBundle(RESOURCE_BASE, locale);
        } catch (MissingResourceException e) {
            // Si no se encuentra el bundle para el idioma actual, usar el idioma por
            // defecto
            LOGGER.warning(
                    "Bundle no encontrado para idioma: " + locale + ". Usando idioma por defecto: " + DEFAULT_LANGUAGE);
            bundle = ResourceBundle.getBundle(RESOURCE_BASE, Locale.forLanguageTag(DEFAULT_LANGUAGE));
        }

        try {
            String message = bundle.getString(key);
            LOGGER.fine("Mensaje encontrado para clave '" + key + "': " + message);
            return message;
        } catch (MissingResourceException e) {
            // Si no se encuentra la clave, devolver la clave como fallback
            LOGGER.warning("No se encontró la clave '" + key + "' en el bundle de idioma " + locale);
            return key;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error al recuperar mensaje para clave: " + key, e);
            return key;
        }
    }

    /**
     * Devuelve la etiqueta para el selector de idioma según el idioma actual.
     * 
     * @param request Petición HTTP
     * @return Etiqueta del idioma actual ("Español", "English", etc.)
     */
    public static String getCurrentLanguageLabel(HttpServletRequest request) {
        Locale locale = getCurrentLocale(request);
        String lang = locale.getLanguage();

        switch (lang) {
            case "es":
                return "Español";
            case "en":
                return "English";
            case "fr":
                return "Français";
            case "de":
                return "Deutsch";
            case "ar":
                return "العربية";
            case "ber":
                return "Bereber";
            case "chi":
                return "Chino";
            default:
                return "Español"; // Idioma por defecto
        }
    }
}