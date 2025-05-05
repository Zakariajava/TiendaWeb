<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <title><i18n:message key="login.title" /></title>
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="login"/>
  </jsp:include>

  <main class="container pt-5 mt-5">
    <div class="row justify-content-center mt-5">
      <div class="col-md-6">
        <h2 class="text-center mb-4"><i18n:message key="login.title" /></h2>

        <!-- Mostrar mensaje de error en caso de fallo en la autenticación -->
        <c:if test="${not empty sessionScope.error}">
          <div class="alert alert-danger">${sessionScope.error}</div>
          <c:remove var="error" scope="session" />
        </c:if>

        <form action="${pageContext.request.contextPath}/login-servlet" method="post">
          <div class="form-group">
            <label for="username"><i18n:message key="login.email" /></label>
            <input type="email" class="form-control" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password"><i18n:message key="login.password" /></label>
            <input type="password" class="form-control" id="password" name="password" required>
          </div>

          <!-- Campo oculto para mantener el flujo del checkout si viene de ahí -->
          <c:choose>
            <c:when test="${param.from == 'carrito'}">
              <input type="hidden" name="from" value="carrito">
            </c:when>
            <c:otherwise>
              <input type="hidden" name="from" value="menu">
            </c:otherwise>
          </c:choose>

          <!-- Botón de login y enlace a registro -->
          <div class="text-center">
            <button type="submit" class="btn btn-primary btn-block"><i18n:message key="login.button" /></button>
            <p class="mt-3">
              <i18n:message key="login.noAccount" />
              <a href="registrar.jsp" class="btn btn-link p-0 align-baseline"><i18n:message key="login.registerHere" /></a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </main>

  <!-- Footer personalizado -->
  <mi-footer></mi-footer>
  
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/wishlist-page.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>