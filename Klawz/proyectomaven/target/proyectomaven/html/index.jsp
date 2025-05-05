<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <!-- 
    Configuración del documento:
    - Uso de UTF-8 para caracteres internacionales.
    - Bootstrap y Font Awesome para diseño responsive moderno.
    - Hoja de estilo personalizada style.css.
  -->
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <!-- Estilos personalizados -->
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <!-- 
    BARRA DE NAVEGACIÓN (NAVBAR)
    - Se adapta según si el usuario ha iniciado sesión.
    - Si hay sesión activa, muestra el nombre del usuario (`usuarioNombre`).
    - Si no, se muestra la opción de "Iniciar Sesión".
  -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="home"/>
  </jsp:include>

  <!-- 
    SECCIÓN PRINCIPAL DEL HOME
    - Presentación destacada de la tienda.
    - Enlace directo a la tienda (shop.jsp).
  -->
  <section id="home">
    <div class="container">
      <h5><i18n:message key="home.newArrivals" /></h5>
      <h1><span><i18n:message key="home.bestPrice" /></span> 2025</h1>
      <p>Klawz <i18n:message key="general.welcome" /> <br><i18n:message key="home.shopNow" /></p>
      <button onclick="window.location.href='shop.jsp'"><i18n:message key="home.shopNow" /></button>
    </div>
  </section>

  <!-- 
    SECCIÓN "Nuestras Marcas"
    - Muestra logos de marcas asociadas.
    - Solo imagen estática, sin interacción.
  -->
  <section id="brand" class="container mt-3">
    <h4 class="text-center"><i18n:message key="home.brands" /></h4>
    <hr style="width: 10%; margin: 0 auto;">
    <div class="row m-0 py-5">
      <!-- Cada imagen representa una marca conocida -->
      <img class="img-fluid col-lg-2 col-md-4 col-6" src="../img/brand/CalvinKlein.png" alt="brand1">
      <img class="img-fluid col-lg-2 col-md-4 col-6" src="../img/brand/Dior.png" alt="brand2">
      <img class="img-fluid col-lg-2 col-md-4 col-6" src="../img/brand/poloralphlauren.png" alt="brand3">
      <img class="img-fluid col-lg-2 col-md-4 col-6" src="../img/brand/tommyhilfiger.png" alt="brand4">
      <img class="img-fluid col-lg-2 col-md-4 col-6" src="../img/brand/michaelkors.png" alt="brand5">
      <img class="img-fluid col-lg-2 col-md-4 col-6" src="../img/brand/zara.png" alt="brand6">
    </div>
  </section>

  <!-- 
    SECCIÓN PROMOCIONAL DE NUEVOS PRODUCTOS
    - Cada bloque redirige a la tienda.
    - Solo imagen + texto promocional.
  -->
  <section id="new" class="w-100">
    <div class="row p-0 m-0">
      <!-- Cada .one representa una promoción visual -->
      <div class="one col-lg-4 col-md-12 col-12 p-0">
        <img class="img-fluid" src="../img/new/1.jpg" alt="">
        <div class="details">
          <h2><i18n:message key="shop.zapatillas" /></h2>
          <button onclick="window.location.href='shop.jsp'"><i18n:message key="home.shopNow" /></button>
        </div>
      </div>
      <div class="one col-lg-4 col-md-12 col-12 p-0">
        <img class="img-fluid" src="../img/new/4.jpg" alt="">
        <div class="details">
          <h2><i18n:message key="general.all" /></h2>
          <button onclick="window.location.href='shop.jsp'"><i18n:message key="home.shopNow" /></button>
        </div>
      </div>
      <div class="one col-lg-4 col-md-12 col-12 p-0">
        <img class="img-fluid" src="../img/new/3.jpg" alt="">
        <div class="details">
          <h2><i18n:message key="home.sale" /> -50%</h2>
          <button onclick="window.location.href='shop.jsp'"><i18n:message key="home.shopNow" /></button>
        </div>
      </div>
    </div>
  </section>

  <!-- 
    SECCIÓN "Destacados"
    - Los productos destacados se cargan dinámicamente desde JS (index.js)
    - Se muestran 4 productos marcados como "destacados" en la base de datos
  -->
  <section id="featured" class="my-5 pb-5">
    <div class="container text-center mt-5 py-5">
      <h3><i18n:message key="home.featured" /></h3>
      <hr style="margin: 0 auto; width: 10%;">
      <p><i18n:message key="shop.title" /></p>
    </div>
    <div id="featured-list" class="row mx-auto container-fluid"></div>
  </section>

  <!-- Sección de banner de promoción -->
  <section id="banner" class="py-5 my-5">
    <div class="container">
      <h4><i18n:message key="home.sale" /></h4>
      <h1><i18n:message key="home.discount" /> <br> 20% OFF</h1>
      <button class="text-uppercase" onclick="window.location.href='shop.jsp'"><i18n:message key="home.shopNow" /></button>
    </div>
  </section>

  <!-- 
    SECCIONES DE PRODUCTOS POR SUBCATEGORÍA:
    - Vestidos
    - Relojes
    - Zapatillas
    - Cada sección carga 4 productos desde index.js filtrando por subcategoría
  -->
  <section id="clothes" class="my-5 pb-5">
    <div class="container text-center mt-5 py-5">
      <h3><i18n:message key="home.dresses" /></h3>
      <hr style="margin: 0 auto">
      <p><i18n:message key="shop.title" /></p>
    </div>
    <div class="row mx-auto container-fluid" id="dresses-list"></div>
  </section>

  <section id="watches" class="my-5 pb-5">
    <div class="container text-center mt-5 py-5">
      <h3><i18n:message key="home.watches" /></h3>
      <hr style="margin: 0 auto">
      <p><i18n:message key="shop.title" /></p>
    </div>
    <div class="row mx-auto container-fluid" id="watches-list"></div>
  </section>

  <section id="shoes" class="my-5 pb-5">
    <div class="container text-center mt-5 py-5">
      <h3><i18n:message key="home.shoes" /></h3>
      <hr style="margin: 0 auto">
      <p><i18n:message key="shop.title" /></p>
    </div>
    <div class="row mx-auto container-fluid" id="shoes-list"></div>
  </section>

  <!-- Footer reutilizable personalizado -->
  <mi-footer></mi-footer>

  <!-- Scripts necesarios -->
  
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>

  <script src="../js/footer.js"></script> <!-- Carga del footer dinámico -->
  <script src="../js/index.js"></script>  <!-- Script que carga productos destacados, por subcategoría, etc. -->
  <script src="../js/wishlist.js"></script>
  <script src="../js/minicart.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>