/**
 * wishlist-page.js - actualizado con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script específico para la página wishlist.jsp
 * Carga los productos guardados en la wishlist y los muestra
 */

document.addEventListener('DOMContentLoaded', () => {
  loadWishlistProducts();
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    loadWishlistProducts();
  });
});

/**
 * Carga los productos de la wishlist y los muestra en la página
 */
async function loadWishlistProducts() {
  try {
    // Contenedor donde mostraremos los productos
    const container = document.getElementById('wishlist-container');
    if (!container) return;
    
    // Verificar si el sistema de traducciones está cargado
    if (typeof window.translations === 'undefined' || Object.keys(window.translations).length === 0) {
      console.warn('Sistema de traducciones no inicializado aún, esperando...');
      // Mostrar spinner mientras esperamos
      container.innerHTML = `
        <div class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="sr-only">Cargando...</span>
          </div>
          <p class="mt-2 mb-0">Cargando traducciones...</p>
        </div>
      `;
      
      // Reintentarlo en 500ms
      setTimeout(loadWishlistProducts, 500);
      return;
    }
    
    // Obtener la wishlist del localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Si no hay productos en la wishlist, mostrar mensaje
    if (wishlist.length === 0) {
      // Primero, verifica explícitamente que las claves existen
      const emptyText = getI18nMessage('wishlist.empty') || 'Your wishlist is empty';
      const addFromShopText = getI18nMessage('wishlist.addFromShop') || 'Add products from the shop to see them here';
      const goToShopText = getI18nMessage('wishlist.goToShop') || 'Go to shop';
      
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-heart-broken fa-3x text-muted mb-3"></i>
          <h4>${emptyText}</h4>
          <p class="text-muted">${addFromShopText}</p>
          <a href="shop.jsp" class="btn btn-outline-primary">${goToShopText}</a>
        </div>
      `;
      
      // Registra para depuración
      console.log('Textos de wishlist vacía:', {
        emptyText,
        addFromShopText,
        goToShopText,
        availableTranslations: window.translations ? Object.keys(window.translations).length : 0
      });
      
      return;
    }
    
    // Intentar cargar productos desde el servidor
    try {
      // Cargar todos los productos del catálogo primero
      const response = await fetch('../producto-index?ajax=true');
      if (!response.ok) throw new Error('Error al cargar productos');
      
      window.allProducts = await response.json();
      
      // Generar HTML para cada producto en la wishlist
      let html = '';
      wishlist.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
          const mainImg = product.imagenes && product.imagenes.length > 0 ? "../" + product.imagenes[0] : '../img/noimage.jpg';
          
          html += `
          <div id="wishlist-item-${product.id}" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4 wishlist-product">
            <div class="card wishlist-card">
              <div class="wishlist-img-container">
                <img src="${mainImg}" class="card-img-top wishlist-img" alt="${product.nombre}">
                <button class="wishlist-remove-btn" onclick="removeFromWishlist(${product.id})">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <div class="card-body">
                <h5 class="card-title">${product.nombre}</h5>
                <div class="price-stock-row">
                  <p class="card-text wishlist-price">${product.precio.toFixed(2)} €</p>
                  <span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? getI18nMessage('product.inStock') : getI18nMessage('product.outOfStock')}
                  </span>
                </div>
                <div class="wishlist-actions">
                  <button class="btn btn-view" onclick="window.location.href='singleproduct.jsp?id=${product.id}'">
                    <i class="fas fa-eye"></i> ${getI18nMessage('wishlist.viewDetails')}
                  </button>
                  <button class="btn btn-add-cart" onclick="addToCartFromWishlist(${product.id})"
                          ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i> ${product.stock > 0 ? getI18nMessage('wishlist.add') : getI18nMessage('product.outOfStock')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        }
      });
      
      // Incluimos un mensaje sobre la cantidad de productos
      html = `
        <div class="col-12 mb-4">
          <div class="wishlist-count-banner">
            <i class="fas fa-heart"></i>
            <span>${getI18nMessage('wishlist.youHave')} ${wishlist.length} ${wishlist.length !== 1 ? getI18nMessage('wishlist.productsPlural') : getI18nMessage('wishlist.productsSingular')}</span>
          </div>
        </div>
      ` + html;
      
      container.innerHTML = html;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Mostrar productos de forma básica sin imágenes ni detalles
      let html = `<div class="col-12"><div class="alert alert-warning">${getI18nMessage('error.generalError')}</div></div>`;
      
      wishlist.forEach(productId => {
        html += `
          <div id="wishlist-item-${productId}" class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4 wishlist-product">
            <div class="card h-100 product-card">
              <div class="card-body">
                <h5 class="card-title">${getI18nMessage('product.details')} #${productId}</h5>
                <div class="mt-2">
                  <button class="btn btn-sm btn-outline-primary" 
                          onclick="window.location.href='singleproduct.jsp?id=${productId}'">
                    <i class="fas fa-eye"></i> ${getI18nMessage('wishlist.viewDetails')}
                  </button>
                  <button class="btn btn-sm btn-outline-danger mt-2" 
                          onclick="removeFromWishlist(${productId})">
                    <i class="fas fa-trash"></i> ${getI18nMessage('wishlist.remove')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    }
  } catch (error) {
    console.error('Error general:', error);
    const container = document.getElementById('wishlist-container');
    if (container) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
          <h4>${getI18nMessage('error.generalError')}</h4>
          <p class="text-muted">${getI18nMessage('error.generalError')}</p>
          <button class="btn btn-outline-primary" onclick="window.location.reload()">
            ${getI18nMessage('general.previous')}
          </button>
        </div>
      `;
    }
  }
}
  
/**
 * Añade un producto al carrito desde la wishlist
 * @param {number} productId - ID del producto a añadir
 */
function addToCartFromWishlist(productId) {
  // Verificar si el producto está disponible
  if (typeof window.allProducts !== 'undefined') {
    const product = window.allProducts.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
      showToast(getI18nMessage('product.outOfStock'));
      return;
    }
  }
  
  // Añadir al carrito (reusando la función existente)
  if (typeof window.addToCart === 'function') {
    window.addToCart(productId);
  } else {
    // Implementación básica por si la función addToCart no está disponible
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.productId === productId);
    
    if (item) {
      item.quantity++;
      showToast(getI18nMessage('cart.update'));
    } else {
      cart.push({ productId, quantity: 1 });
      showToast(getI18nMessage('product.addToCart'));
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}