/**
 * minicart.js - actualizado con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script que gestiona el mini-carrito en la barra de navegación.
 * Permite ver un resumen del carrito, eliminar productos, y
 * modificar cantidades sin tener que ir a la página completa.
 */

// Variables globales
let cartProducts = []; // Productos en el carrito con detalles completos

/**
 * Inicializa el mini-carrito cuando el DOM está cargado
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar el botón del carrito para mostrar/ocultar el mini-carrito
  setupMiniCartButton();
  
  // Cargar productos y actualizar contador de productos en el carrito
  updateMiniCartCounter();
  
  // Cargar productos del carrito desde localStorage
  loadCartProducts();
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    refreshMiniCart();
  });
});

/**
 * Configura el comportamiento del botón del carrito
 * para mostrar/ocultar el mini-carrito
 */
function setupMiniCartButton() {
  const cartButton = document.getElementById('cart-button');
  const minicartDropdown = document.getElementById('minicart-dropdown');
  
  if (cartButton && minicartDropdown) {
    // En dispositivos móviles, mantener el comportamiento normal de redirección
    if (window.innerWidth < 992) {
      return; // Comportamiento normal, navegar a cart.jsp
    }
    
    // En escritorio, implementar el hover para mostrar el mini-carrito
    cartButton.addEventListener('mouseenter', () => {
      // Ocultar cualquier otro dropdown abierto (como wishlist)
      const wishlistDropdown = document.getElementById('wishlist-dropdown');
      if (wishlistDropdown && wishlistDropdown.classList.contains('show')) {
        wishlistDropdown.classList.remove('show');
      }
      
      refreshMiniCart();
      minicartDropdown.classList.add('show');
    });
    
    // Al hacer clic, ir directamente a la página del carrito
    cartButton.addEventListener('click', (e) => {
      // No preventDefault aquí, dejamos que el enlace funcione normalmente
      // Ocultamos el dropdown en caso de que esté abierto
      minicartDropdown.classList.remove('show');
    });
    
    // Mantener visible mientras se pasa el ratón por el dropdown
    minicartDropdown.addEventListener('mouseenter', () => {
      minicartDropdown.classList.add('show');
    });
    
    minicartDropdown.addEventListener('mouseleave', () => {
      minicartDropdown.classList.remove('show');
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (minicartDropdown.classList.contains('show') && 
          !cartButton.contains(e.target) && 
          !minicartDropdown.contains(e.target)) {
        minicartDropdown.classList.remove('show');
      }
    });
  }
}

/**
 * Actualiza el contador de productos en el carrito
 */
function updateMiniCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const counter = document.getElementById('cart-counter');
  if (counter) {
    counter.textContent = itemCount;
    counter.style.display = itemCount > 0 ? 'flex' : 'none';
  }
}

/**
 * Carga los productos del carrito con sus detalles completos
 */
async function loadCartProducts() {
  try {
    // Obtener los productos del carrito desde localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Si no hay productos, no hacer nada más
    if (cart.length === 0) {
      cartProducts = [];
      return;
    }
    
    // Obtener todos los productos disponibles
    const response = await fetch('../producto-index?ajax=true');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
    const allProducts = await response.json();
    
    // Crear un array con los detalles completos de cada producto en el carrito
    cartProducts = cart.map(cartItem => {
      const product = allProducts.find(p => p.id === cartItem.productId);
      if (product) {
        return {
          ...product,
          quantity: cartItem.quantity
        };
      }
      return null;
    }).filter(item => item !== null); // Eliminar productos que no existen
    
  } catch (error) {
    console.error('Error cargando productos del carrito:', error);
    cartProducts = [];
  }
}

/**
 * Refresca el contenido del mini-carrito
 */
function refreshMiniCart() {
  const minicartContent = document.getElementById('minicart-content');
  if (!minicartContent) return;
  
  // Obtener estado actual del carrito
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Si el carrito está vacío, mostrar mensaje
  if (cart.length === 0) {
    minicartContent.innerHTML = `
      <div class="minicart-empty-message">
        <i class="fas fa-shopping-cart"></i>
        <p>${getI18nMessage('cart.empty')}</p>
      </div>
    `;
    return;
  }
  
  // Si no tenemos cartProducts cargados, intentar cargarlos
  if (cartProducts.length === 0) {
    // En este caso, mostrar un spinner mientras se cargan
    minicartContent.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="sr-only">${getI18nMessage('general.loading')}...</span>
        </div>
        <p class="mt-2 mb-0">${getI18nMessage('general.loading')}...</p>
      </div>
    `;
    
    // Cargar productos asíncronamente
    loadCartProducts().then(() => {
      // Cuando terminen de cargar, volver a llamar a esta función
      refreshMiniCart();
    });
    return;
  }
  
  // Calcular el subtotal del carrito
  let subtotal = 0;
  cartProducts.forEach(product => {
    subtotal += product.precio * product.quantity;
  });
  
  // Construir HTML para cada producto en el carrito
  let itemsHtml = '';
  
  // Mostrar todos los productos con scroll
  cartProducts.forEach(product => {
    const mainImg = product.imagenes && product.imagenes.length > 0 ? 
      `../${product.imagenes[0]}` : '../img/noimage.jpg';
    
    itemsHtml += `
      <div class="minicart-item" data-product-id="${product.id}">
        <div class="minicart-item-img">
          <img src="${mainImg}" alt="${product.nombre}">
        </div>
        <div class="minicart-item-info">
          <p class="minicart-item-name">${product.nombre.length > 20 ? product.nombre.substring(0, 20) + '...' : product.nombre}</p>
          <p class="minicart-item-price">${product.precio.toFixed(2)} €</p>
          <div class="minicart-item-quantity">
            <button class="minicart-quantity-btn" onclick="decreaseCartQuantity(${product.id})">
              <i class="fas fa-minus"></i>
            </button>
            <span class="minicart-quantity-value">${product.quantity}</span>
            <button class="minicart-quantity-btn" onclick="increaseCartQuantity(${product.id}, ${product.stock})">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <button class="minicart-item-action" onclick="removeFromCart(${product.id})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });
  
  // Agregar sección de total y botones
  const footerHtml = `
    <div class="minicart-footer">
      <div class="minicart-total">
        <span>${getI18nMessage('cart.total')}:</span>
        <span>${subtotal.toFixed(2)} €</span>
      </div>
      <div class="minicart-actions">
        <a href="../html/cart.jsp" class="btn btn-outline-primary btn-sm">${getI18nMessage('nav.cart')}</a>
        <a href="../html/cart.jsp" class="btn btn-primary btn-sm">${getI18nMessage('cart.checkout')}</a>
      </div>
    </div>
  `;
  
  // Actualizar el contenido del mini-carrito
  minicartContent.innerHTML = itemsHtml + footerHtml;
}

/**
 * Elimina un producto del carrito
 * @param {number} productId - ID del producto a eliminar
 */
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Filtrar el producto a eliminar
  cart = cart.filter(item => item.productId !== productId);
  
  // Guardar el carrito actualizado
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Eliminar el producto de cartProducts
  cartProducts = cartProducts.filter(product => product.id !== productId);
  
  // Actualizar el contador y el mini-carrito
  updateMiniCartCounter();
  refreshMiniCart();
  
  // Mostrar notificación
  showCartNotification(getI18nMessage('cart.remove'));
}

/**
 * Incrementa la cantidad de un producto en el carrito
 * @param {number} productId - ID del producto
 * @param {number} stock - Stock disponible del producto
 */
function increaseCartQuantity(productId, stock) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let item = cart.find(i => i.productId === productId);
  
  if (!item) return;
  
  // Verificar que no excedamos el stock
  if (item.quantity < stock) {
    item.quantity++;
    
    // Actualizar el carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar la cantidad en cartProducts
    const product = cartProducts.find(p => p.id === productId);
    if (product) {
      product.quantity = item.quantity;
    }
    
    // Actualizar la vista
    updateMiniCartCounter();
    refreshMiniCart();
    
    // Mostrar notificación
    showCartNotification(getI18nMessage('cart.update'));
  } else {
    showCartNotification(getI18nMessage('product.outOfStock'), 'warning');
  }
}

/**
 * Disminuye la cantidad de un producto en el carrito
 * @param {number} productId - ID del producto
 */
function decreaseCartQuantity(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let item = cart.find(i => i.productId === productId);
  
  if (!item) return;
  
  // Si la cantidad es 1, eliminar el producto
  if (item.quantity === 1) {
    removeFromCart(productId);
    return;
  }
  
  // Disminuir la cantidad
  item.quantity--;
  
  // Actualizar el carrito en localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Actualizar la cantidad en cartProducts
  const product = cartProducts.find(p => p.id === productId);
  if (product) {
    product.quantity = item.quantity;
  }
  
  // Actualizar la vista
  updateMiniCartCounter();
  refreshMiniCart();
  
  // Mostrar notificación
  showCartNotification(getI18nMessage('cart.update'));
}

/**
 * Muestra una notificación sobre cambios en el carrito
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación: 'success' (default), 'warning', 'error'
 */
function showCartNotification(message, type = 'success') {
  // Buscar o crear contenedor de notificaciones
  let notificationContainer = document.getElementById('cart-notifications');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'cart-notifications';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.bottom = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '1070';
    document.body.appendChild(notificationContainer);
  }
  
  // Crear la notificación
  const notification = document.createElement('div');
  notification.className = 'toast';
  notification.style.minWidth = '250px';
  notification.style.backgroundColor = type === 'success' ? '#4caf50' : 
                                      type === 'warning' ? '#ff9800' : '#f44336';
  notification.style.color = '#ffffff';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '4px';
  notification.style.marginTop = '10px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.opacity = '0';
  notification.style.transition = 'all 0.3s ease';
  
  // Ícono según el tipo
  const icon = type === 'success' ? 'fas fa-check-circle' : 
               type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-times-circle';
  
  notification.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i> ${message}`;
  
  // Añadir al contenedor y mostrar
  notificationContainer.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}