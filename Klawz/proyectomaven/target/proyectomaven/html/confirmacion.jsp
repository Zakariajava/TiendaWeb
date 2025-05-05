<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<%@ page import="tienda.*, java.util.*" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="checkout.confirmation" /> | Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" crossorigin="anonymous">

  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">

</head>

<body>
  <!-- Barra de navegación común -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="none"/>
  </jsp:include>

  <main class="container my-5 py-5">
    <%
      // Obtener el ID del pedido de los parámetros de la URL
      String pedidoIdParam = request.getParameter("pedido");
      int pedidoId = 0;
      boolean pedidoExiste = false;
      double total = 0.0;
      
      // Verificar si hay sesión de usuario
      HttpSession userSession = request.getSession(false);
      boolean sesionValida = (userSession != null && userSession.getAttribute("usuarioId") != null);
      
      if (pedidoIdParam != null) {
        try {
          pedidoId = Integer.parseInt(pedidoIdParam);
          
          // Solo verificar en base de datos si hay sesión válida
          if (sesionValida) {
            int usuarioId = (int)userSession.getAttribute("usuarioId");
            
            // Verificar si el pedido existe y pertenece al usuario
            PedidoDAO dao = new PedidoDAO();
            pedidoExiste = dao.verificarPedidoUsuario(pedidoId, usuarioId);
            
            // Si el pedido existe, obtener detalles adicionales
            if (pedidoExiste) {
              List<Pedido> pedidos = dao.obtenerPedidosConDetallesPorUsuario(usuarioId);
              for (Pedido p : pedidos) {
                if (p.getId() == pedidoId) {
                  // Calcular total
                  total = p.getDetalles().stream()
                      .mapToDouble(d -> d.getPrecio() * d.getCantidad())
                      .sum();
                  
                  // Añadir costos de envío
                  total += 5.0; // Costo fijo de envío
                  
                  request.setAttribute("pedido", p);
                  break;
                }
              }
            }
          }
        } catch (NumberFormatException e) {
          // ID de pedido inválido
          pedidoExiste = false;
        }
      }
      
      // Limpiar carrito después de la verificación exitosa
      if (pedidoExiste && sesionValida) {
        // Eliminar carrito de localStorage mediante JavaScript
        out.println("<script>localStorage.removeItem('cart');</script>");
      }
      
      request.setAttribute("pedidoExiste", pedidoExiste);
      request.setAttribute("pedidoId", pedidoId);
      request.setAttribute("total", total);
    %>
    
    <c:choose>
      <c:when test="${pedidoExiste}">
        <!-- Mostrar confirmación de pedido exitoso -->
        <div class="confirmation-container">
          <div class="text-center mb-4">
            <i class="fas fa-check-circle success-icon"></i>
            <h2><i18n:message key="checkout.orderSuccess" /></h2>
            <p class="lead"><i18n:message key="checkout.thankYou" /></p>
          </div>
          
          <div class="order-header">
            <div>
              <h5><i18n:message key="checkout.orderId" />: #${pedidoId}</h5>
              <small class="text-muted"><i18n:message key="checkout.date" />: ${pedido.fecha}</small>
            </div>
            <div class="order-status">
              <i class="fas fa-truck"></i> ${pedido.estado}
            </div>
          </div>
          
          <!-- Resumen de productos -->
          <h5><i18n:message key="checkout.orderSummary" /></h5>
          <div class="products-list mb-4">
            <c:forEach items="${pedido.detalles}" var="detalle">
              <div class="product-item">
                <div class="product-details">
                  <div class="product-name">${detalle.nombreProducto}</div>
                  <div class="text-muted">${detalle.cantidad} x ${detalle.precio} €</div>
                </div>
                <div class="product-price">
                  ${detalle.cantidad * detalle.precio} €
                </div>
              </div>
            </c:forEach>
          </div>
          
          <!-- Resumen de costos -->
          <div class="cost-summary">
            <div class="summary-row">
              <span><i18n:message key="cart.subtotal" /></span>
              <span>${total - 5.0} €</span>
            </div>
            <div class="summary-row">
              <span><i18n:message key="cart.shipping" /></span>
              <span>5.00 €</span>
            </div>
            <div class="summary-row total-row">
              <span><i18n:message key="cart.total" /></span>
              <span>${total} €</span>
            </div>
          </div>
          
          <!-- Información de envío y pago simplificada -->
          <div class="shipping-info">
            <h5><i18n:message key="checkout.shippingInfo" /></h5>
            <p><i class="fas fa-map-marker-alt mr-2"></i> ${sessionScope.usuarioNombre} ${sessionScope.usuarioApellidos}</p>
            <p class="text-muted">${sessionScope.usuarioDomicilio}, ${sessionScope.usuarioPoblacion} ${sessionScope.usuarioCp}, ${sessionScope.usuarioProvincia}</p>
          </div>
          
          <div class="action-buttons">
            <a href="shop.jsp" class="btn btn-primary">
              <i class="fas fa-shopping-bag mr-2"></i> <i18n:message key="checkout.continueShopping" />
            </a>
            <a href="usuario.jsp" class="btn btn-outline-secondary">
              <i class="fas fa-user mr-2"></i> <i18n:message key="nav.myAccount" />
            </a>
          </div>
        </div>
      </c:when>
      <c:otherwise>
        <!-- Mostrar mensaje de error -->
        <div class="error-container">
          <i class="fas fa-exclamation-circle error-icon"></i>
          <h2><i18n:message key="checkout.errorOccurred" /></h2>
          <p class="text-muted mb-4">
            <i18n:message key="checkout.orderError" />
          </p>
          
          <div class="action-buttons">
            <a href="shop.jsp" class="btn btn-primary">
              <i class="fas fa-shopping-bag mr-2"></i> <i18n:message key="checkout.continueShopping" />
            </a>
            <a href="cart.jsp" class="btn btn-outline-secondary">
              <i class="fas fa-shopping-cart mr-2"></i> <i18n:message key="nav.cart" />
            </a>
          </div>
          
          <p class="mt-4 text-muted small">
            <i18n:message key="checkout.redirecting" />
          </p>
          
          <script>
            // Redirigir a la tienda después de 5 segundos
            setTimeout(function() {
              window.location.href = 'shop.jsp';
            }, 5000);
          </script>
        </div>
      </c:otherwise>
    </c:choose>
  </main>

  <!-- Footer personalizado -->
  <mi-footer></mi-footer>

  <!-- Scripts necesarios -->
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  
  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>