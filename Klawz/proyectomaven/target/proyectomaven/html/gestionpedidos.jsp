<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>

<!-- 
  Redirección automática si no hay sesión iniciada.
  Se utiliza JSTL para comprobar si `usuarioId` no está en la sesión.
  Si está vacío, se redirige al login.
-->
<c:if test="${empty sessionScope.usuarioId}">
  <c:redirect url="login.jsp" />
</c:if>

<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="orders.title" /> | Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
  
</head>

<body>
  <!-- Barra de navegación -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="user"/>
  </jsp:include>

  <!-- Contenido principal -->
  <div class="container mt-5 pt-5">
    <div class="row">
      <div class="col-12 mt-5 mb-4">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h2 class="mb-0"><i18n:message key="orders.title" /></h2>
            <p class="text-muted mb-0"><i18n:message key="orders.manage" /></p>
          </div>
          <a href="usuario.jsp" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left"></i> <i18n:message key="orders.backToAccount" />
          </a>
        </div>
        <hr>
      </div>
    </div>
    
    <!-- Leyenda de estados -->
    <div class="row">
      <div class="col-md-8 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="mb-3"><i18n:message key="orders.statusLegend" /></h5>
            <div class="d-flex flex-wrap">
              <div class="mr-4 mb-2">
                <span class="badge badge-warning"><i18n:message key="orders.status.pending" /></span>
                <small class="ml-1"><i18n:message key="orders.status.pendingDesc" /></small>
              </div>
              <div class="mr-4 mb-2">
                <span class="badge badge-primary"><i18n:message key="orders.status.shipped" /></span>
                <small class="ml-1"><i18n:message key="orders.status.shippedDesc" /></small>
              </div>
              <div class="mr-4 mb-2">
                <span class="badge badge-success"><i18n:message key="orders.status.delivered" /></span>
                <small class="ml-1"><i18n:message key="orders.status.deliveredDesc" /></small>
              </div>
              <div class="mb-2">
                <span class="badge badge-danger"><i18n:message key="orders.status.cancelled" /></span>
                <small class="ml-1"><i18n:message key="orders.status.cancelledDesc" /></small>
              </div>
            </div>
            <p class="mt-2 mb-0 small text-muted">
              <i class="fas fa-info-circle"></i> 
              <i18n:message key="orders.cancelInfo" />
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Contenedor para los pedidos -->
    <div class="row">
      <div class="col-12 mb-5">
        <!-- Spinner de carga -->
        <div id="loading-spinner" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only"><i18n:message key="general.loading" />...</span>
          </div>
          <p class="mt-2"><i18n:message key="orders.loading" />...</p>
        </div>
        
        <!-- Contenedor donde se renderizarán los pedidos -->
        <div id="orders-container"></div>
        
        <!-- Mensaje en caso de error -->
        <div id="error-container" class="d-none">
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i>
            <i18n:message key="orders.loadError" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <mi-footer></mi-footer>

  <!-- Scripts -->
  
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/gestionpedidos.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/wishlist-page.js"></script>
  <script>
    // Ocultar el spinner cuando los pedidos estén cargados
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        document.getElementById('loading-spinner').style.display = 'none';
      }, 1000);
    });
  </script>

<jsp:include page="components/common-scripts.jsp" />
</body>
</html>