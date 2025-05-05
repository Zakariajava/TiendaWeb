<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <!-- 
    Cabecera HTML con configuraciones fundamentales:
    - Codificación UTF-8 para caracteres especiales.
    - Bootstrap para estilos responsive.
    - Font Awesome para iconos.
    - Icono del proyecto y hoja de estilos personalizada.
  -->
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="${pageContext.request.contextPath}/html/translations.jsp"></script>
  <title><i18n:message key="cart.title" /></title>
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <!-- 
    NAVBAR principal de la aplicación.
    - Usa JSTL para mostrar el nombre del usuario si está logueado.
    - El enlace a "Carrito" se marca como activo.
  -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="cart"/>
  </jsp:include>

  <main>
    <!-- 
      Sección de encabezado de la página "Carrito de Compra".
      - Espaciado para compensar el navbar fijo.
    -->
    <section id="featured" class="my-5 py-5 container">
      <h2 class="fw-bold pt-5"><i18n:message key="cart.title" /></h2>
      <hr>
    </section>

    <!-- 
      Tabla que muestra el contenido actual del carrito:
      - Las filas son generadas dinámicamente por JavaScript.
      - Contiene columnas para eliminar producto, imagen, nombre, precio, cantidad y subtotal.
    -->
    <section id="cart-container" class="container my-5">
      <h4><i18n:message key="cart.title" /></h4>
      <table id="cart-table" style="width: 100%;">
        <thead>
          <tr>
            <td><i18n:message key="cart.remove" /></td>
            <td><i18n:message key="cart.image" /></td>
            <td><i18n:message key="cart.product" /></td>
            <td><i18n:message key="cart.price" /></td>
            <td><i18n:message key="cart.quantity" /></td>
            <td><i18n:message key="cart.subtotal" /></td>
          </tr>
        </thead>
        <tbody></tbody> <!-- JS lo rellena con productos -->
      </table>
    </section>

    <!-- 
      Sección inferior del carrito:
      - A la izquierda se encuentra el formulario para aplicar cupones.
      - A la derecha se muestra el resumen de totales: subtotal, envío y total.
      - Incluye botón "FINALIZAR COMPRA" que redirige según sesión al carrito resumen o login.
    -->
    <section id="cart-bottom" class="container">
      <div class="row">
        <!-- Campo para aplicar un cupón -->
        <div class="coupon col-lg-6 col-md-6 col-12 mb-4">
          <div>
            <h5><i18n:message key="cart.coupon" /></h5>
            <p><i18n:message key="cart.couponIntro" /></p>
            <input type="text" placeholder="<i18n:message key="cart.couponCode" />" id="coupon-input">
            <button type="button" id="apply-coupon-btn"><i18n:message key="cart.applyCoupon" /></button>
          </div>
        </div>

        <!-- Total del carrito -->
        <div class="total col-lg-6 col-md-6 col-12">
          <div>
            <h5><i18n:message key="cart.total" /></h5>
            <div class="d-flex justify-content-between">
              <h6><i18n:message key="cart.subtotal" /></h6>
              <p id="cart-subtotal">0 €</p>
            </div>
            <div class="d-flex justify-content-between">
              <h6><i18n:message key="cart.shipping" /></h6>
              <p id="cart-shipping">5 €</p>
            </div>
            <hr class="second-hr">
            <div class="d-flex justify-content-between">
              <h6><i18n:message key="cart.total" /></h6>
              <p id="cart-total">0 €</p>
            </div>

            <!-- Botón para pasar al proceso de compra -->
            <button type="button" class="ms-auto" id="checkoutBtn"><i18n:message key="cart.checkout" /></button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- 
    Footer definido como componente personalizado.
    Incluye redes sociales, contacto y links generales.
  -->
  <mi-footer></mi-footer>

  <!-- 
    Scripts para Bootstrap y funcionalidades JS del footer y carrito:
    - `cart.js` maneja lógica de cantidades, totales, cupones y sesión.
  -->
  
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/cart.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>

</html>