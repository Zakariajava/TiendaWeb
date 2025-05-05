<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">

<head>
  <!-- 
    Configuración básica del documento HTML:
    - Uso de codificación UTF-8.
    - Bootstrap para el diseño responsive.
    - FontAwesome para iconos.
    - Icono personalizado (favicon).
    - Estilos propios definidos en style.css.
  -->
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="cart.title" /> | Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">

</head>

<body>
  <!--
    NAVBAR común en toda la aplicación:
    - Contiene enlaces a páginas clave como Inicio, Tienda, Nosotros, Contacto.
    - Muestra nombre del usuario si está logueado o enlace a iniciar sesión.
    - Marca la pestaña "Carrito" como activa.
  -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="cart"/>
  </jsp:include>

  <main>
    <!--
      Sección de encabezado para el resumen del carrito.
      Aparece tras iniciar sesión y pulsar "FINALIZAR COMPRA".
    -->
    <section id="featured" class="my-5 py-5 container">
      <h2 class="fw-bold pt-5"><i18n:message key="checkout.title" /></h2>
      <hr>
    </section>

    <!-- Tabla que muestra los productos del carrito en modo solo lectura -->
    <section id="cart-container" class="container my-5">
      <table id="cart-table" style="width: 100%;">
        <thead>
          <tr>
            <td><i18n:message key="cart.image" /></td>
            <td><i18n:message key="cart.product" /></td>
            <td><i18n:message key="cart.price" /></td>
            <td><i18n:message key="cart.quantity" /></td>
            <td><i18n:message key="cart.subtotal" /></td>
          </tr>
        </thead>
        <tbody></tbody> <!-- Se rellena dinámicamente desde JS -->
      </table>
    </section>

    <!-- 
      Sección con el resumen de totales:
      - Subtotal: suma de precios por cantidad.
      - Envío: fijo.
      - Total: suma final.
      - Botones para continuar comprando, formalizar pedido o cerrar sesión.
    -->
    <section id="cart-bottom" class="container">
      <div class="row">
        <div class="total col-lg-6 offset-lg-6 col-md-6 col-12">
          <div>
            <h5><i18n:message key="cart.title" /></h5>
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
            <div class="mt-3">
              <button id="btn-continuar" class="btn btn-outline-secondary mr-2"><i18n:message key="cart.continue" /></button>
              <button id="btn-formalizar" class="btn btn-success mr-2"><i18n:message key="cart.checkout" /></button>
              <button id="btn-logout" class="btn btn-danger"><i18n:message key="general.logout" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--
      Formulario que aparece al pulsar "Finalizar compra":
      - Solicita datos de envío.
      - Permite seleccionar método de pago.
      - Muestra campos adicionales dinámicamente según opción.
    -->
    <section class="container my-5" id="formulario-checkout" style="display: none;">
      <h4><i18n:message key="checkout.delivery" /> & <i18n:message key="checkout.payment" /></h4>
      <form id="checkout-form">
        <div class="form-group">
          <label for="nombre"><i18n:message key="checkout.name" /></label>
          <input type="text" class="form-control" id="nombre" name="nombre"
            value="${sessionScope.usuarioNombre} ${sessionScope.usuarioApellidos}" readonly>
        </div>
        
        <!-- Datos de envío con opción de edición -->
        <div class="form-group">
          <div class="d-flex justify-content-between align-items-center">
            <label for="domicilio"><i18n:message key="checkout.address" /></label>
            <button type="button" id="btn-editar-direccion" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-edit"></i> <i18n:message key="checkout.editAddress" />
            </button>
            <button type="button" id="btn-guardar-direccion" class="btn btn-sm btn-success" style="display: none;">
              <i class="fas fa-save"></i> <i18n:message key="general.save" />
            </button>
            <button type="button" id="btn-cancelar-edicion" class="btn btn-sm btn-outline-secondary" style="display: none;">
              <i class="fas fa-times"></i> <i18n:message key="general.cancel" />
            </button>
          </div>
          <input type="text" class="form-control" id="domicilio" required readonly>
        </div>
        
        <div class="form-group">
          <label for="telefono"><i18n:message key="checkout.phone" /></label>
          <input type="text" class="form-control" id="telefono" name="telefono" required readonly>
        </div>
        <div class="form-row">
          <div class="form-group col-md-4">
            <label for="cp"><i18n:message key="checkout.zip" /></label>
            <input type="text" class="form-control" id="cp" required readonly>
          </div>
          <div class="form-group col-md-4">
            <label for="poblacion"><i18n:message key="checkout.city" /></label>
            <input type="text" class="form-control" id="poblacion" required readonly>
          </div>
          <div class="form-group col-md-4">
            <label for="provincia"><i18n:message key="checkout.province" /></label>
            <input type="text" class="form-control" id="provincia" required readonly>
          </div>
        </div>

        <!-- Botones de acción del formulario -->
        <button type="submit" class="btn btn-success"><i18n:message key="checkout.placeOrder" /></button>
        <button type="button" class="btn btn-secondary ml-2" id="cancelar-compra"><i18n:message key="general.cancel" /></button>
      </form>
    </section>
  </main>

  <!-- Footer personalizado -->
  <mi-footer></mi-footer>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si estamos en la página de checkout
    if (document.getElementById('formulario-checkout')) {
      // Usar SOLO la función inicializarSelectorPago mejorada
      document.getElementById('btn-formalizar').addEventListener('click', function() {
      // Solo inicializar si el formulario está visible
      if (document.getElementById('formulario-checkout').style.display === 'block') {
        setTimeout(function() {
        inicializarSelectorPago();
        }, 500);
      }
      });
      }
    });
  </script>
  <!-- Scripts necesarios para funcionalidad de Bootstrap y lógica JS del carrito -->
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>

  <script src="../js/footer.js"></script>
  <script src="../js/carrito-resumen.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  <script>
    // Pasar datos de sesión a JavaScript
    const usuarioDomicilio = "${sessionScope.usuarioDomicilio}";
    const usuarioCp = "${sessionScope.usuarioCp}";
    const usuarioPoblacion = "${sessionScope.usuarioPoblacion}";
    const usuarioProvincia = "${sessionScope.usuarioProvincia}";
    const usuarioTelefono = "${sessionScope.usuarioTelefono}";
  </script>

  <jsp:include page="components/common-scripts.jsp" />
</body>

</html>