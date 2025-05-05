<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="shop.title" /> | Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="shop"/>
  </jsp:include>

  <button class="filter-btn" id="filter-btn">
    <i class="fa-solid fa-filter"></i>
    <span class="filter-badge" id="filter-badge" style="display: none;">0</span>
  </button>
  
  <div class="filter-sidebar z-index-sidebar" id="filter-sidebar">
    <button class="filter-close" id="filter-close">
      <i class="fa-solid fa-times"></i>
    </button>
    <div class="filter-header">
      <h4><i18n:message key="shop.filter" /></h4>
      <small id="total-products-count"><i18n:message key="shop.results" /></small>
      <a class="filter-clear" id="clear-all-filters"><i18n:message key="shop.clearFilters" /></a>
    </div>
    <div class="filter-content">
      <!-- Categorías principales -->
      <div class="filter-group">
        <span class="filter-title">
          <i18n:message key="shop.categories" />
          <i class="fa-solid fa-chevron-down"></i>
        </span>
        <div class="filter-options">
          <div class="form-check filter-category">
            <input class="form-check-input" type="checkbox" value="1" id="cat-hombre" data-filter="category">
            <label class="form-check-label" for="cat-hombre">
              <i18n:message key="shop.men" />
            </label>
          </div>
          <div class="form-check filter-category">
            <input class="form-check-input" type="checkbox" value="2" id="cat-mujer" data-filter="category">
            <label class="form-check-label" for="cat-mujer">
              <i18n:message key="shop.women" />
            </label>
          </div>
          <div class="form-check filter-category">
            <input class="form-check-input" type="checkbox" value="3" id="cat-ninos" data-filter="category">
            <label class="form-check-label" for="cat-ninos">
              <i18n:message key="shop.kids" />
            </label>
          </div>
        </div>
      </div>
      
      <!-- Subcategorías -->
      <div class="filter-group">
        <span class="filter-title">
          <i18n:message key="shop.subcategories" />
          <i class="fa-solid fa-chevron-down"></i>
        </span>
        <div class="filter-options">
          <!-- Subcategorías de Hombre -->
          <div class="filter-subgroup">
            <h6 class="ml-2 mt-3 text-muted"><i18n:message key="shop.men" /></h6>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="1" id="subcat-abrigos-hombre" data-filter="subcategory">
              <label class="form-check-label" for="subcat-abrigos-hombre">
                <i18n:message key="shop.abrigos" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="2" id="subcat-camisetas" data-filter="subcategory">
              <label class="form-check-label" for="subcat-camisetas">
                <i18n:message key="shop.camisetas" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="3" id="subcat-relojes-hombre" data-filter="subcategory">
              <label class="form-check-label" for="subcat-relojes-hombre">
                <i18n:message key="shop.relojes" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="4" id="subcat-zapatillas-hombre" data-filter="subcategory">
              <label class="form-check-label" for="subcat-zapatillas-hombre">
                <i18n:message key="shop.zapatillas" />
              </label>
            </div>
          </div>

          <!-- Subcategorías de Mujer -->
          <div class="filter-subgroup">
            <h6 class="ml-2 mt-3 text-muted"><i18n:message key="shop.women" /></h6>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="5" id="subcat-abrigos-mujer" data-filter="subcategory">
              <label class="form-check-label" for="subcat-abrigos-mujer">
                <i18n:message key="shop.abrigos" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="6" id="subcat-relojes-mujer" data-filter="subcategory">
              <label class="form-check-label" for="subcat-relojes-mujer">
                <i18n:message key="shop.vestidos" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="7" id="subcat-vestidos" data-filter="subcategory">
              <label class="form-check-label" for="subcat-vestidos">
                <i18n:message key="shop.relojes" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="8" id="subcat-zapatillas-mujer" data-filter="subcategory">
              <label class="form-check-label" for="subcat-zapatillas-mujer">
                <i18n:message key="shop.zapatillas" />
              </label>
            </div>
          </div>

          <!-- Subcategorías de Niños -->
          <div class="filter-subgroup">
            <h6 class="ml-2 mt-3 text-muted"><i18n:message key="shop.kids" /></h6>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="9" id="subcat-chaquetas" data-filter="subcategory">
              <label class="form-check-label" for="subcat-chaquetas">
                <i18n:message key="shop.chaquetas" />
              </label>
            </div>
            <div class="form-check filter-subcategory">
              <input class="form-check-input" type="checkbox" value="10" id="subcat-zapatillas-ninos" data-filter="subcategory">
              <label class="form-check-label" for="subcat-zapatillas-ninos">
                <i18n:message key="shop.zapatillas" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="filter-overlay z-index-overlay" id="filter-overlay"></div>

  <section id="featured" class="my-5 py-5">
    <div class="container mt-5 py-5">
      <h2 class="font-weight-bold"><i18n:message key="shop.title" /></h2>
      <hr>
      <p><i18n:message key="home.shopNow" /></p>
      
      <!-- Barra de búsqueda -->
      <div class="container mt-3">
        <div class="row">
          <div class="col-md-8 mx-auto">
            <div class="search-container">
              <div class="input-group">
                <input 
                  type="text" 
                  id="product-search" 
                  class="form-control search-input" 
                  placeholder="<i18n:message key="shop.search" />" 
                  aria-label="<i18n:message key="shop.search" />">
                <div class="input-group-append">
                  <button class="btn btn-sm btn-search" type="button" id="search-clear" style="display: none;">
                    <i class="fa-solid fa-times"></i>
                  </button>
                  <button class="btn btn-search" type="button">
                    <i class="fa-solid fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Muestra de filtros activos -->
      <div class="active-filters" id="active-filters"></div>
    </div>

    <!-- Contenedor de productos -->
    <div id="shop-list" class="row mx-auto container"></div>

    <!-- Paginación dinámica -->
    <div class="row mx-auto container" id="shop-pagination"></div>
  </section>

  <!-- Footer personalizado -->
  <mi-footer></mi-footer>

  <!-- Scripts -->
  
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/shop.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/wishlist-page.js"></script>
  <script src="../js/minicart.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>