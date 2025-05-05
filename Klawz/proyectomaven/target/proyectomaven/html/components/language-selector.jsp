<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>

<select id="language-dropdown" class="language-select">
  <option value="" disabled selected><%= tienda.LanguageUtil.getCurrentLanguageLabel(request) %></option>
  <option value="en">English</option>
  <option value="es">Español</option>
  <option value="fr">Français</option>
  <option value="de">Deutsch</option>
  <option value="ar">العربية</option>
  <option value="ber">Bereber</option>
  <option value="chi">Chino</option>
</select>

<script>
  const langContextPath = '${pageContext.request.contextPath}';
  const langCurrentPage = window.location.pathname.replace('${pageContext.request.contextPath}', '');
</script>
<script src="${pageContext.request.contextPath}/js/language-selector.js"></script>