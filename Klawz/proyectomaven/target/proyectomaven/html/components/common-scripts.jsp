<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- 
  common-scripts.jsp
  ---------------------------------------------------------
  Archivo centralizado para incluir todos los scripts comunes.
  Debe ser incluido en todas las páginas JSP después de translations.jsp.
  
  Este enfoque garantiza consistencia en la carga de scripts y reduce
  la duplicación de inclusiones en cada página.
-->

<!-- Carga de traducciones - SIEMPRE debe ir primero para que el resto de scripts tengan acceso -->
<script src="${pageContext.request.contextPath}/html/translations.jsp"></script>

<%-- Test JSP processing --%>
<% String contextPath = request.getContextPath(); %>
<script>console.log("JSP Context Path: <%= contextPath %>");</script>
<script src="<%= contextPath %>/js/payment-methods.js"></script>

<!-- Sistema de internacionalización -->
<script src="${pageContext.request.contextPath}/js/i18n-manager.js"></script>

<!-- Sistema de notificaciones no intrusivas -->
<script src="${pageContext.request.contextPath}/js/notifications.js"></script>



<!-- Modo oscuro -->
<script src="${pageContext.request.contextPath}/js/dark-mode.js"></script>

<!-- Script de inicialización -->
<script>
  // Inicializar i18n cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    // Intentar inicializar i18n si no está ya inicializado
    if (window.i18n && !window.i18n.initialized) {
      window.i18n.init();
    }
  });
</script>