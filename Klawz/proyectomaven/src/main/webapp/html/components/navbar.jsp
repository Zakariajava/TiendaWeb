<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>

<!-- 
  COMPONENTE NAVBAR
  Este componente renderiza la barra de navegación de toda la aplicación.
  
  Parámetros:
  - activePage: Determina qué enlace del menú debe marcarse como activo
    Valores posibles: "home", "shop", "about", "contact", "login", "cart", "wishlist"
-->

<nav class="navbar navbar-expand-lg navbar-light bg-white py-0 fixed-top">
  <div class="container">
    <a href="${pageContext.request.contextPath}/html/index.jsp">
      <img src="../img/logo/logo1.svg" alt="logo" class="navbar-logo">
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span> <i id="bar" class="fa-solid fa-bars navbar-burger-icon"></i> </span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ml-auto">
        <!-- Enlaces de navegación principales -->
        <li class="nav-item">
          <a class="nav-link ${param.activePage == 'home' ? 'active' : ''}" 
            href="${pageContext.request.contextPath}/html/index.jsp">
            <i18n:message key="nav.home" />
          </a>
        </li>
        
        <li class="nav-item">
          <a class="nav-link ${param.activePage == 'shop' ? 'active' : ''}" 
            href="shop.jsp">
            <i18n:message key="nav.shop" />
          </a>
        </li>
        
        <li class="nav-item">
          <a class="nav-link ${param.activePage == 'about' ? 'active' : ''}" 
            href="about.jsp">
            <i18n:message key="nav.about" />
          </a>
        </li>
        
        <li class="nav-item">
          <a class="nav-link ${param.activePage == 'contact' ? 'active' : ''}" 
            href="contact.jsp">
            <i18n:message key="nav.contact" />
          </a>
        </li>
        
        <!-- Control de sesión: Usuario logueado o enlace a login -->
        <c:choose>
          <c:when test="${not empty sessionScope.usuarioId}">
            <li class="nav-item">
              <a class="nav-link ${param.activePage == 'user' ? 'active' : ''}" 
                href="usuario.jsp">
                ${sessionScope.usuarioNombre}
              </a>
            </li>
          </c:when>
          <c:otherwise>
            <li class="nav-item">
              <a class="nav-link ${param.activePage == 'login' ? 'active' : ''}" 
                href="login.jsp">
                <i18n:message key="nav.login" />
              </a>
            </li>
          </c:otherwise>
        </c:choose>
        
        <!-- Wishlist button -->
        <li class="nav-item wishlist-nav-item">
          <a id="wishlist-button" class="nav-link ${param.activePage == 'wishlist' ? 'active' : ''}" href="wishlist.jsp">
            <i class="far fa-heart"></i>
            <span class="wishlist-badge" id="wishlist-counter" style="display:none;">0</span>
          </a>
          <div id="wishlist-dropdown">
            <div id="wishlist-dropdown-content">
              <!-- Content will be filled by JavaScript -->
            </div>
          </div>
        </li>
        
         <!-- Enlace al carrito con mini-carrito -->
        <li class="nav-item cart-nav-item">
          <a class="nav-link ${param.activePage == 'cart' ? 'active' : ''}" id="cart-button" 
            href="cart.jsp">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-badge" id="cart-counter" style="display:none;">0</span>
          </a>
          <!-- Mini-carrito dropdown -->
          <div id="minicart-dropdown">
            <div id="minicart-content">
              <!-- Content will be filled by JavaScript -->
            </div>
          </div>
        </li>
        
        <!-- Selector de idioma (componente ya existente) -->
        <li class="nav-item">
          <jsp:include page="language-selector.jsp" />
        </li>
        
        <!-- Toggle modo oscuro -->
        <li class="nav-item">
          <button id="toggleDarkMode" class="btn btn-sm">
            <i class="fas fa-moon" id="darkModeIcon"></i>
            <i class="fas fa-sun" id="lightModeIcon" style="display: none;"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</nav>