<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="productdetail.title" /></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
  
</head>

<body>
  <!-- Barra de navegación -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="shop"/>
  </jsp:include>

  <!-- Breadcrumb -->
  <div class="container mt-5 pt-5">
    <nav aria-label="breadcrumb" class="mt-3">
      <ol class="breadcrumb bg-transparent">
        <li class="breadcrumb-item"><a href="${pageContext.request.contextPath}/html/index.jsp"><i18n:message key="nav.home" /></a></li>
        <li class="breadcrumb-item"><a href="shop.jsp"><i18n:message key="nav.shop" /></a></li>
        <li class="breadcrumb-item active" aria-current="page" id="breadcrumb-product-name"><i18n:message key="productdetail.info" /></li>
      </ol>
    </nav>
  </div>

  <!-- Contenedor principal del producto -->
  <section class="container sproduct pb-5">
    <div class="product-container">
      <div class="row">
        <!-- Imagen principal y miniaturas -->
        <div class="col-lg-6 col-md-12 col-12">
          <div class="main-img-container">
            <img src="../img/noimage.jpg" id="MainImg" alt="Producto">
          </div>
          <div class="small-img-group" id="small-img-container">
            <!-- Miniaturas cargadas por JS -->
          </div>
        </div>
        
        <!-- Información del producto -->
        <div class="col-lg-6 col-md-12 col-12">
          <div class="product-info">
            <div id="prod-category"><i18n:message key="productdetail.info" /></div>
            <h2 id="prod-name"><i18n:message key="productdetail.namePlaceholder" /></h2>
            <h3 id="prod-price">0,00 €</h3>
            
            <!-- Botón de wishlist -->
            <div id="wishlist-container"></div>
            
            <div id="prod-description">
              <i18n:message key="productdetail.descriptionPlaceholder" />
            </div>
            
            <div class="quantity-control">
              <input type="number" value="1" min="1" id="prod-quantity">
              <button id="addCartBtn">
                <i class="fas fa-shopping-cart"></i>
                <i18n:message key="productdetail.addToCart" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pestañas con información adicional -->
      <div class="product-details">
        <ul class="nav nav-tabs productdetail-tabs" id="productTabs" role="tablist">
          <li class="nav-item">
            <a class="nav-link active" id="details-tab" data-toggle="tab" href="#details" role="tab">
              <i18n:message key="productdetail.details" />
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="shipping-tab" data-toggle="tab" href="#shipping" role="tab">
              <i18n:message key="productdetail.shipping" />
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="reviews-tab" data-toggle="tab" href="#reviews" role="tab">
              <i18n:message key="productdetail.reviews" />
            </a>
          </li>
        </ul>
        
        <div class="tab-content" id="productTabsContent">
          <!-- Tab de detalles -->
          <div class="tab-pane fade show active" id="details" role="tabpanel">
            <div id="extended-description">
              <!-- Contenido cargado por JS -->
            </div>
          </div>
          
          <!-- Tab de envío -->
          <div class="tab-pane fade" id="shipping" role="tabpanel">
            <h4><i18n:message key="productdetail.shippingInfo" /></h4>
            <ul>
              <li><i18n:message key="productdetail.freeShippingDesc" /></li>
              <li><i18n:message key="productdetail.deliveryTime" /></li>
              <li><i18n:message key="productdetail.returnPolicy" /></li>
            </ul>
          </div>
          
          <!-- Tab de reseñas -->
          <div class="tab-pane fade" id="reviews" role="tabpanel">
            <h4><i18n:message key="productdetail.reviews" /></h4>
            <!-- Contenido de reseñas (simplificado) -->
            <div class="review-list">
              <div class="review-item">
                <div class="reviewer">
                  <strong>Juan P.</strong> - 
                  <small>15/03/2025</small>
                  <div>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                  </div>
                </div>
                <p class="mt-2">Excelente producto, la calidad es increíble y el precio es muy razonable.</p>
              </div>
              <hr>
              <div class="review-item">
                <div class="reviewer">
                  <strong>María L.</strong> - 
                  <small>02/04/2025</small>
                  <div>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                    <i class="fas fa-star text-warning"></i>
                    <i class="far fa-star text-warning"></i>
                  </div>
                </div>
                <p class="mt-2">Buen producto, llegó a tiempo y es exactamente como se muestra en las fotos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Productos relacionados -->
  <section class="container related-products">
    <h3><i18n:message key="productdetail.relatedProducts" /></h3>
    <div class="row" id="related-products-container">
      <!-- Productos relacionados cargados por JS -->
    </div>
  </section>

  <!-- Footer -->
  <mi-footer></mi-footer>

  <!-- Scripts -->
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  
  <script src="../js/footer.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/singleproduct.js"></script>
  <script src="../js/minicart.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>