<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="cart.empty" /></title>

  <!-- Estilos Bootstrap y personalizados -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <!-- NAVBAR principal -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="cart"/>
  </jsp:include>

  <!-- Contenido principal con mensaje de carrito vacío -->
  <main class="d-flex align-items-center justify-content-center empty-cart-container">
    <div class="text-center px-4">
      <h1 class="text-danger mb-4">❌ <i18n:message key="cart.emptyMessage" /></h1>
      <p class="lead mb-4">
        <i18n:message key="cart.productsUnavailable" />
      </p>
      <a href="shop.jsp" class="btn btn-outline-primary btn-lg">
        <i class="fa-solid fa-store"></i> <i18n:message key="cart.backToShop" />
      </a>
    </div>
  </main>

  <!-- Footer mediante Web Component -->
  <mi-footer></mi-footer>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/index.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/wishlist-page.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>

</html>