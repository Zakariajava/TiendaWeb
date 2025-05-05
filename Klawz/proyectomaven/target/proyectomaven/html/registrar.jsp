<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <!--
    METADATOS Y RECURSOS
    - Se especifica el tipo de contenido (UTF-8) y el uso de JSTL.
    - Se incluyen Bootstrap y FontAwesome para un diseño visual moderno.
    - Se enlaza el favicon y una hoja de estilos personalizada (style.css).
  -->
  <meta charset="UTF-8">
  <title><i18n:message key="register.title" /></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <!--
    BARRA DE NAVEGACIÓN
    - Permite al usuario navegar entre las distintas páginas.
    - Si hay una sesión iniciada, se muestra el nombre del usuario.
    - En caso contrario, se muestra un enlace para iniciar sesión.
  -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="login"/>
  </jsp:include>

  <!--
    CONTENEDOR PRINCIPAL DEL FORMULARIO
    - Se muestra centrado en la página con márgenes y rellenos adecuados.
    - Incluye todos los campos necesarios para el registro del usuario.
    - Se validan los campos requeridos, como el nombre, el correo electrónico y la contraseña.
  -->
  <div class="container" style="margin-top: 100px;">
    <div class="container text-left mt-5 py-5">
      <h3><i18n:message key="register.title" /></h3>

      <!--
        FORMULARIO DE REGISTRO
        - Al enviarse, realiza una solicitud POST a /registro-servlet, que maneja la lógica en el backend.
        - Utiliza nombres de campo coherentes con los esperados en RegisterServlet.java.
      -->
      <form action="<%= request.getContextPath() %>/registro-servlet" method="post">
        <div class="form-group">
          <label for="regName"><i18n:message key="register.name" /></label>
          <input type="text" name="regName" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regLastname"><i18n:message key="register.lastname" /></label>
          <input type="text" name="regLastname" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regAddress"><i18n:message key="register.address" /></label>
          <input type="text" name="regAddress" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regCity"><i18n:message key="register.city" /></label>
          <input type="text" name="regCity" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regProvince"><i18n:message key="register.province" /></label>
          <input type="text" name="regProvince" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regZip"><i18n:message key="register.zip" /></label>
          <input type="text" name="regZip" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regPhone"><i18n:message key="register.phone" /></label>
          <input type="text" name="regPhone" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regEmail"><i18n:message key="register.email" /></label>
          <input type="email" name="regEmail" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regPassword"><i18n:message key="register.password" /></label>
          <input type="password" name="regPassword" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="regPassword2"><i18n:message key="register.confirmPassword" /></label>
          <input type="password" name="regPassword2" class="form-control" required>
        </div>

        <!--
          BOTÓN DE ENVÍO Y ENLACE PARA INICIAR SESIÓN
          - Están centrados y proporcionan acceso a la página de inicio de sesión en caso de que el usuario ya tenga una cuenta.
        -->
        <div class="text-center">
          <button type="submit" class="btn btn-primary btn-block"><i18n:message key="register.button" /></button>
          <p class="mt-3">
            <i18n:message key="register.haveAccount" />
            <a href="login.jsp" class="btn btn-link p-0 align-baseline"><i18n:message key="register.loginHere" /></a>
          </p>
        </div>
      </form>

      <!--
        MENSAJE DE ERROR EN CASO DE REGISTRO FALLIDO
        - Muestra los errores gestionados por RegisterServlet (campos vacíos, correo electrónico existente, contraseñas no coincidentes, etc.).
      -->
      <c:if test="${not empty sessionScope.errorReg}">
        <div class="alert alert-danger mt-3">
          <c:out value="${sessionScope.errorReg}" />
        </div>
        <c:remove var="errorReg" scope="session" />
      </c:if>
    </div>
  </div>

  <!-- Pie de página y scripts -->
  <mi-footer></mi-footer>
  
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>

  <script src="../js/footer.js"></script>
  <script src="../js/register.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/wishlist-page.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>
