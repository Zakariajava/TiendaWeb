<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Lista de Deseos | Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <!-- Barra de navegación (incluida como componente) -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="wishlist"/>
  </jsp:include>

  <!-- Sección principal con encabezado -->
  <section id="featured" class="my-5 py-5 container">
    <div class="container mt-5 py-5">
      <div class="wishlist-header">
        <h2 class="font-weight-bold"><i18n:message key="wishlist.title" /></h2>
        <hr>
        <p><i18n:message key="wishlist.subtitle" /></p>
      </div>
      
      <!-- Contenedor para los productos de la wishlist -->
      <div id="wishlist-container" class="row mx-auto container">
        <!-- Los productos se cargarán dinámicamente con JavaScript -->
        <!-- Inicialmente mostramos un spinner de carga -->
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Cargando...</span>
          </div>
          <p class="mt-3">Cargando tus productos guardados...</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer mediante Web Component -->
  <mi-footer></mi-footer>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>

  <script src="../js/wishlist.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist-page.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
  
</body>
</html>