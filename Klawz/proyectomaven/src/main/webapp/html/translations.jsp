<%@ page contentType="text/javascript" pageEncoding="UTF-8" import="java.util.*" %>
<%@ page import="tienda.LanguageUtil" %>
<%@ page import="java.util.ResourceBundle" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="java.util.Locale" %>

<%
// Obtener el idioma actual del usuario
Locale currentLocale = tienda.LanguageUtil.getCurrentLocale(request);
String currentLanguage = currentLocale.getLanguage();
ResourceBundle bundle = null;

try {
    // Cargar el bundle de mensajes para el idioma actual
    bundle = ResourceBundle.getBundle("tienda.messages", currentLocale);
} catch (Exception e) {
    // Si hay un error, usar el idioma por defecto (español)
    bundle = ResourceBundle.getBundle("tienda.messages", Locale.forLanguageTag("es"));
    // Registrar el error para depuración
    e.printStackTrace();
}

// Iniciar el script JavaScript
%>
// Objeto global de traducciones - Generado para <%= currentLanguage %>
window.translations = {
<%
// Iterar sobre todas las claves disponibles en el ResourceBundle
Enumeration<String> keys = bundle.getKeys();
boolean isFirst = true;

while (keys.hasMoreElements()) {
    String key = keys.nextElement();
    String value = bundle.getString(key);
    
    // Escapar comillas simples y dobles
    value = value.replace("\\", "\\\\")
                 .replace("'", "\\'")
                 .replace("\"", "\\\"");
    
    // Añadir coma entre entradas (excepto para la primera)
    if (!isFirst) {
        out.print(",\n");
    } else {
        isFirst = false;
    }
    
    // Escribir par clave-valor
    out.print("    '" + key + "': '" + value + "'");
}
%>
};

// Debug info - Eliminar en producción
console.log('Translations loaded: <%= keys.hasMoreElements() ? "NO" : "YES" %>, Language: <%= currentLanguage %>');

// Guardar el idioma actual para referencia
window.currentLanguage = '<%= currentLanguage %>';

// Inicializar el sistema i18n si está disponible
document.addEventListener('DOMContentLoaded', function() {
    if (window.i18n && typeof window.i18n.init === 'function') {
        window.i18n.init();
    }
});