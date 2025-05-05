/**
 * wishlist.js - versión actualizada con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script que gestiona la funcionalidad de la lista de deseos (wishlist).
 * Permite añadir/quitar productos y muestra notificaciones al usuario.
 * Usa el sistema centralizado de internacionalización (i18n).
 */

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Cargar wishlist desde localStorage
  updateWishlistCounter();

  // Configurar el botón de wishlist en la barra de navegación
  setupWishlistNavButton();
  
  // Actualizar el estado de los botones en la página actual
  updateAllWishlistButtons();
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    refreshWishlistDropdown();
  });
});

/**
 * Actualiza el contador de productos en la wishlist.
 * Se muestra como un badge en el botón de wishlist.
 */
function updateWishlistCounter() {
  const wishlist = getWishlist();
  const wishlistCounter = wishlist.length;
  
  const counter = document.getElementById('wishlist-counter');
  if (counter) {
    counter.textContent = wishlistCounter;
    counter.style.display = wishlistCounter > 0 ? 'flex' : 'none';
  }
}

/**
 * Configura el botón de wishlist en la barra de navegación.
 * Modificado para usar hover como el mini-carrito.
 */
function setupWishlistNavButton() {
  const wishlistButton = document.getElementById('wishlist-button');
  const wishlistDropdown = document.getElementById('wishlist-dropdown');
  
  if (wishlistButton && wishlistDropdown) {
    // En dispositivos móviles solo navegamos a la página de wishlist
    if (window.innerWidth < 992) {
      return; // El enlace funciona normalmente
    }
    
    // En escritorio, usamos hover para mostrar el dropdown
    wishlistButton.addEventListener('mouseenter', () => {
      // Ocultar cualquier otro dropdown abierto (como minicart)
      const minicartDropdown = document.getElementById('minicart-dropdown');
      if (minicartDropdown && minicartDropdown.classList.contains('show')) {
        minicartDropdown.classList.remove('show');
      }
      
      // Actualizar contenido antes de mostrar
      refreshWishlistDropdown();
      wishlistDropdown.classList.add('show');
    });
    
    // Al hacer clic, ir directamente a la página de wishlist
    wishlistButton.addEventListener('click', (e) => {
      // No preventDefault aquí, dejamos que el enlace funcione normalmente
      // Ocultamos el dropdown en caso de que esté abierto
      wishlistDropdown.classList.remove('show');
    });
    
    // Mantener visible mientras se pasa el ratón por el dropdown
    wishlistDropdown.addEventListener('mouseenter', () => {
      wishlistDropdown.classList.add('show');
    });
    
    wishlistDropdown.addEventListener('mouseleave', () => {
      wishlistDropdown.classList.remove('show');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (wishlistDropdown && wishlistDropdown.classList.contains('show') && 
          wishlistButton && !wishlistButton.contains(e.target) && 
          !wishlistDropdown.contains(e.target)) {
        wishlistDropdown.classList.remove('show');
      }
    });
  }
}

/**
 * Refresca el contenido del dropdown de wishlist.
 * Muestra los últimos 3 productos añadidos y un enlace para ver todos.
 */
function refreshWishlistDropdown() {
  const dropdown = document.getElementById('wishlist-dropdown');
  if (!dropdown) return;
  
  const wishlist = getWishlist();
  const dropdownContent = document.getElementById('wishlist-dropdown-content');
  
  if (wishlist.length === 0) {
    // Wishlist vacía - usar getI18nMessage para traducciones
    dropdownContent.innerHTML = `
      <div class="wishlist-empty-message">
        <i class="fas fa-heart-broken"></i>
        <p>${getI18nMessage('wishlist.empty')}</p>
      </div>
    `;
    return;
  }
  
  // Si la página actual es la wishlist, sólo mostrar contador
  const isWishlistPage = window.location.href.includes('wishlist.jsp');
  if (isWishlistPage) {
    dropdownContent.innerHTML = `
      <div class="wishlist-simple-list">
        <p><i class="fas fa-heart"></i> ${getI18nMessage('wishlist.youHave')} ${wishlist.length} ${wishlist.length !== 1 ? getI18nMessage('wishlist.productsPlural') : getI18nMessage('wishlist.productsSingular')}</p>
      </div>
      <div class="wishlist-footer">
        <a href="#" class="btn btn-outline-primary btn-sm" onclick="document.getElementById('wishlist-dropdown').classList.remove('show'); return false;">
          ${getI18nMessage('general.close')}
        </a>
      </div>
    `;
    return;
  }
  
  // Intentar cargar productos si no están disponibles
  if (!window.allProducts || window.allProducts.length === 0) {
    // Si no tenemos productos cargados, intentar cargarlos
    fetch('../producto-index?ajax=true')
      .then(response => response.json())
      .then(products => {
        window.allProducts = products;
        // Volver a llamar a esta función para mostrar los productos ya cargados
        refreshWishlistDropdown();
      })
      .catch(error => {
        console.error('Error cargando productos para wishlist:', error);
        // Si falla, mostrar mensaje simple
        dropdownContent.innerHTML = `
          <div class="wishlist-simple-list">
            <p><i class="fas fa-heart"></i> ${getI18nMessage('wishlist.youHave')} ${wishlist.length} ${wishlist.length !== 1 ? getI18nMessage('wishlist.productsPlural') : getI18nMessage('wishlist.productsSingular')}</p>
          </div>
          <div class="wishlist-footer">
            <a href="wishlist.jsp" class="btn btn-primary btn-sm">${getI18nMessage('wishlist.viewAll')}</a>
          </div>
        `;
      });
    
    // Mientras se cargan, mostrar un spinner
    dropdownContent.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="sr-only">${getI18nMessage('general.loading')}...</span>
        </div>
        <p class="mt-2 mb-0">${getI18nMessage('wishlist.loading')}...</p>
      </div>
    `;
    return;
  }
  
  // Ya tenemos los productos cargados, mostrar miniaturas
  let html = '<div class="wishlist-items">';
  let itemsShown = 0;
  
  wishlist.forEach(productId => {
    const product = window.allProducts.find(p => p.id === productId);
    if (product) {
      const mainImg = product.imagenes && product.imagenes.length > 0 ? "../" + product.imagenes[0] : '../img/noimage.jpg';
      html += `
        <div class="wishlist-item">
          <div class="wishlist-item-img">
            <img src="${mainImg}" alt="${product.nombre}">
          </div>
          <div class="wishlist-item-info">
            <p class="wishlist-item-name">${product.nombre.substring(0, 20)}${product.nombre.length > 20 ? '...' : ''}</p>
            <p class="wishlist-item-price">${product.precio.toFixed(2)} €</p>
          </div>
          <button class="wishlist-item-action" onclick="removeFromWishlist(${product.id}); event.stopPropagation();">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      itemsShown++;
    }
  });
  
  html += '</div>';
  
  // Mostrar si hay más productos que los mostrados
  const remaining = wishlist.length - itemsShown;
  if (remaining > 0) {
    html += `
      <div class="wishlist-more-items">
        <p>${getI18nMessage('wishlist.andMore', {count: remaining})}</p>
      </div>
    `;
  }
  
  // Añadir enlace a la página completa
  html += `
    <div class="wishlist-footer">
      <a href="wishlist.jsp" class="btn btn-primary btn-sm">${getI18nMessage('wishlist.viewAll')} (${wishlist.length})</a>
    </div>
  `;
  
  dropdownContent.innerHTML = html;
}

/**
 * Obtiene la lista actual de productos favoritos.
 * @returns {Array} Array de IDs de productos en la wishlist
 */
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

/**
 * Verifica si un producto está en la wishlist.
 * @param {number} productId - ID del producto a verificar
 * @returns {boolean} true si está en la wishlist, false en caso contrario
 */
function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.includes(parseInt(productId));
}

/**
 * Añade un producto a la wishlist.
 * @param {number} productId - ID del producto a añadir
 * @param {boolean} updateUI - Si debe actualizar los elementos visuales
 */
function addToWishlist(productId, updateUI = true) {
  // Asegurarse de que productId sea un número
  productId = parseInt(productId);
  if (isNaN(productId)) {
    console.error("ID de producto no válido:", productId);
    return;
  }
  
  let wishlist = getWishlist();
  
  // Evitar duplicados
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Mostrar mensaje de éxito - usar getI18nMessage para traducción
    showToast(getI18nMessage('wishlist.added'));
    
    if (updateUI) {
      // Actualizar contador y botones
      updateWishlistCounter();
      updateAllWishlistButtons();
    }
  }
}

/**
 * Elimina un producto de la wishlist.
 * @param {number} productId - ID del producto a eliminar
 * @param {boolean} updateUI - Si debe actualizar los elementos visuales
 */
function removeFromWishlist(productId, updateUI = true) {
  // Asegurarse de que productId sea un número
  productId = parseInt(productId);
  if (isNaN(productId)) {
    console.error("ID de producto no válido:", productId);
    return;
  }
  
  let wishlist = getWishlist();
  
  // Filtrar el producto
  wishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  
  // Mostrar mensaje - usar getI18nMessage para traducción
  showToast(getI18nMessage('wishlist.removed'));
  
  if (updateUI) {
    // Actualizar contador y botones
    updateWishlistCounter();
    updateAllWishlistButtons();
    
    // Si estamos en la página de wishlist, puede que necesitemos eliminar visualmente el producto
    const wishlistItem = document.getElementById(`wishlist-item-${productId}`);
    if (wishlistItem) {
      wishlistItem.classList.add('wishlist-item-removed');
      setTimeout(() => {
        wishlistItem.remove();
        
        // Si la wishlist está vacía, mostrar mensaje
        if (document.querySelectorAll('.wishlist-product').length === 0) {
          const container = document.getElementById('wishlist-container');
          if (container) {
            container.innerHTML = `
              <div class="col-12 text-center py-5">
                <i class="fas fa-heart-broken fa-3x text-muted mb-3"></i>
                <h4>${getI18nMessage('wishlist.empty')}</h4>
                <p class="text-muted">${getI18nMessage('wishlist.addFromShop')}</p>
                <a href="shop.jsp" class="btn btn-outline-primary">${getI18nMessage('wishlist.goToShop')}</a>
              </div>
            `;
          }
        }
      }, 300); // Tiempo para la animación
    }
    
    // Actualizar el dropdown si está abierto
    const dropdown = document.getElementById('wishlist-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      refreshWishlistDropdown();
    }
  }
}

/**
 * Actualiza todos los botones de wishlist en la página actual
 * basándose en el estado actual de la wishlist
 */
function updateAllWishlistButtons() {
  const wishlist = getWishlist();
  
  // Actualizar todos los botones específicos por ID de producto
  document.querySelectorAll('[class*="wishlist-btn-"]').forEach(btn => {
    // Extraer el ID del producto de la clase
    const classNames = btn.className.split(' ');
    const btnClassWithId = classNames.find(cls => cls.startsWith('wishlist-btn-'));
    
    if (btnClassWithId) {
      const productId = parseInt(btnClassWithId.replace('wishlist-btn-', ''));
      const isAdded = wishlist.includes(productId);
      
      updateButtonState(btn, isAdded);
    }
  });
  
  // También actualizar el botón de detalle de producto si existe
  const wishlistToggle = document.getElementById('wishlist-toggle');
  if (wishlistToggle) {
    // Buscar el product ID en el URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!isNaN(productId)) {
      const isAdded = wishlist.includes(productId);
      updateButtonState(wishlistToggle, isAdded);
      
      // Actualizar también el evento onclick
      const action = isAdded 
        ? `removeFromWishlist(${productId}, true)` 
        : `addToWishlist(${productId}, true)`;
      wishlistToggle.setAttribute('onclick', action);
    }
  }
}

/**
 * Actualiza el estado visual de un botón de wishlist
 * @param {HTMLElement} btn - El botón a actualizar
 * @param {boolean} isAdded - true si está en wishlist, false si no
 */
function updateButtonState(btn, isAdded) {
  if (isAdded) {
    btn.classList.add('in-wishlist');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.remove('far');
      icon.classList.add('fas');
    }
    // Usar getI18nMessage para traducción
    btn.setAttribute('title', getI18nMessage('wishlist.removeFromWishlist'));
    
    // Actualizar texto si existe
    const textSpan = btn.querySelector('span');
    if (textSpan) {
      textSpan.textContent = getI18nMessage('wishlist.removeFromWishlist');
    }
  } else {
    btn.classList.remove('in-wishlist');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.remove('fas');
      icon.classList.add('far');
    }
    // Usar getI18nMessage para traducción
    btn.setAttribute('title', getI18nMessage('wishlist.addToWishlist'));
    
    // Actualizar texto si existe
    const textSpan = btn.querySelector('span');
    if (textSpan) {
      textSpan.textContent = getI18nMessage('wishlist.addToWishlist');
    }
  }
}

/**
 * Muestra una notificación toast temporal
 * @param {string} message - Mensaje a mostrar
 */
function showToast(message) {
  // Verificar si ya existe un toast container
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    // Crear el contenedor de toasts si no existe
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Crear el toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  
  // Añadir al contenedor
  toastContainer.appendChild(toast);
  
  // Mostrar con animación y eliminar después
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * Toggle de wishlist: añade o quita un producto según su estado actual
 * @param {number} productId - ID del producto
 * @param {Event} event - Evento del clic (opcional)
 */
function toggleWishlist(productId, event) {
  // Detener la propagación del evento si está disponible
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
  } else {
    addToWishlist(productId);
  }
}