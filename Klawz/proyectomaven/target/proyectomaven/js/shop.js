/**
 * shop.js - actualizado con sistema i18n centralizado
 * -----------------------------------------------------------
 * - Corrige problemas de interactividad con los filtros
 * - Mejora la navegación entre productos
 * - Añade animaciones y efectos visuales
 * - Implementa traducciones correctas
 */

/**
 * Variables globales para gestionar el estado de la aplicación
 */
let allProducts = [];           // Todos los productos disponibles
let filteredProducts = [];      // Productos filtrados según criterios actuales
let currentPage = 1;            // Página actual de la tienda
const pageSize = 12;            // Número de productos por página
let searchQuery = '';           // Texto de búsqueda actual
let searchTimeout = null;       // Para implementar debounce en la búsqueda

/**
 * Objeto para almacenar los filtros activos por tipo
 * - category: IDs de categorías seleccionadas
 * - subcategory: IDs de subcategorías seleccionadas
 */
const activeFilters = {
  category: [],
  subcategory: []
};

/**
 * Al cargar el DOM, se inicializan los componentes de la tienda
 * - Solicita productos al servidor
 * - Configura eventos de los filtros y búsqueda
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos desde el servidor
  loadProducts();
  
  // Inicializar componentes de filtrado y búsqueda
  initializeFilters();
  
  // Añadimos entrada con animación para los elementos
  animateElementsOnLoad();
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    renderShopPage(currentPage);
  });
});

/**
 * Carga los productos del servidor mediante AJAX
 * y renderiza la primera página de resultados
 */
function loadProducts() {
  fetch('../productos?ajax=true')
    .then((resp) => resp.json())
    .then((data) => {
      allProducts = data;
      filteredProducts = [...allProducts]; // Inicialmente todos los productos
      updateFilteredProductsCount();
      renderShopPage(currentPage);
    })
    .catch((err) => console.error('Error cargando productos:', err));
}

/**
 * Inicializa los eventos y comportamiento de los componentes de filtrado
 * y búsqueda de productos. Configura todos los listeners de eventos necesarios.
 */
function initializeFilters() {
  // Referencias a elementos del DOM para el panel de filtros
  const filterBtn = document.getElementById('filter-btn');
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterClose = document.getElementById('filter-close');
  const filterOverlay = document.getElementById('filter-overlay');
  const clearAllFilters = document.getElementById('clear-all-filters');

  // Abrir panel de filtros al hacer clic en el botón flotante
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      filterSidebar.classList.add('active');
      filterOverlay.classList.add('active');
      document.body.classList.add('no-scroll');
      document.body.classList.remove('auto-scroll');
    });
  }

  // Cerrar panel de filtros al hacer clic en el botón X
  if (filterClose) {
    filterClose.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar propagación al overlay
      filterSidebar.classList.remove('active');
      filterOverlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
      document.body.classList.add('auto-scroll');
    });
  }

  // Cerrar panel de filtros al hacer clic en el overlay oscuro
  if (filterOverlay) {
    filterOverlay.addEventListener('click', () => {
      filterSidebar.classList.remove('active');
      filterOverlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
      document.body.classList.add('auto-scroll');
    });
  }

  // Prevenir que los clics dentro del sidebar se propaguen al overlay
  if (filterSidebar) {
    filterSidebar.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Limpiar todos los filtros al hacer clic en "Limpiar todos los filtros"
  if (clearAllFilters) {
    clearAllFilters.addEventListener('click', () => {
      // Desmarcar todos los checkboxes de filtro
      document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Limpiar los arrays de filtros activos
      activeFilters.category = [];
      activeFilters.subcategory = [];
      
      // Actualizar la interfaz de usuario
      updateActiveFiltersUI();
      updateFilterBadge();
      
      // Re-renderizar productos (mostrar todos)
      filteredProducts = [...allProducts];
      currentPage = 1;
      updateFilteredProductsCount();
      renderShopPage(currentPage);
    });
  }

  // Toggle para mostrar/ocultar secciones de filtros al hacer clic en sus títulos
  document.querySelectorAll('.filter-title').forEach(title => {
    title.addEventListener('click', () => {
      const options = title.nextElementSibling;
      const icon = title.querySelector('i');
      
      // Cambiar visibilidad y rotación del icono
      if (options.style.display === 'none') {
        options.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      } else {
        options.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }
    });
  });

  // Configurar eventos para cada checkbox de filtro
  document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });

  // Inicializar la funcionalidad de búsqueda
  initializeSearch();
}

/**
 * Inicializa la funcionalidad de búsqueda en tiempo real
 */
function initializeSearch() {
  const searchInput = document.getElementById('product-search');
  const searchClearBtn = document.getElementById('search-clear');
  
  if (!searchInput) return; // Protección en caso de que el elemento no exista
  
  // Evento para búsqueda mientras se escribe (con debounce)
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Mostrar/ocultar botón de limpiar según si hay texto
    searchClearBtn.style.display = query.length > 0 ? 'block' : 'none';
    
    // Implementar debounce para no disparar la búsqueda en cada tecla
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = query;
      // Aplicar búsqueda y filtros
      applySearchAndFilters();
    }, 300); // Esperar 300ms después de que el usuario deje de escribir
  });
  
  // Evento para limpiar la búsqueda al hacer clic en el botón X
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      applySearchAndFilters();
      searchInput.focus();
    });
  }
  
  // Evento para evitar que el formulario se envíe al presionar Enter
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Aplicar búsqueda inmediatamente cuando se presiona Enter
      searchQuery = searchInput.value.trim();
      applySearchAndFilters();
    }
  });
}

/**
 * Maneja cambios en los checkboxes de filtros
 * @param {Event} e - Evento del checkbox
 */
function handleFilterChange(e) {
  const checkbox = e.target;
  const filterType = checkbox.dataset.filter; // 'category' o 'subcategory'
  const value = parseInt(checkbox.value);
  
  // Actualizar array de filtros activos
  if (checkbox.checked) {
    // Añadir a filtros activos si no existe
    if (!activeFilters[filterType].includes(value)) {
      activeFilters[filterType].push(value);
    }
  } else {
    // Eliminar de filtros activos
    activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
  }
  
  // Aplicar filtros y actualizar UI
  applySearchAndFilters();
  updateActiveFiltersUI();
  updateFilterBadge();
}

/**
 * Aplica la búsqueda y los filtros de categoría juntos
 * Filtra los productos según todos los criterios activos
 */
function applySearchAndFilters() {
  // Reiniciar a todos los productos
  let tempProducts = [...allProducts];
  
  // Paso 1: Aplicar filtros de categoría/subcategoría
  if (activeFilters.category.length > 0 || activeFilters.subcategory.length > 0) {
    tempProducts = tempProducts.filter(product => {
      // Filtro por categoría
      const passesCategoryFilter = 
        activeFilters.category.length === 0 || 
        activeFilters.category.includes(product.categoriaId);
      
      // Filtro por subcategoría
      const passesSubcategoryFilter = 
        activeFilters.subcategory.length === 0 || 
        activeFilters.subcategory.includes(product.subcategoriaId);
      
      // Debe pasar ambos filtros
      return passesCategoryFilter && passesSubcategoryFilter;
    });
  }
  
  // Paso 2: Aplicar búsqueda de texto
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    
    tempProducts = tempProducts.filter(product => {
      // Buscar en nombre
      const nameMatch = product.nombre && product.nombre.toLowerCase().includes(query);
      
      // Buscar en descripción
      const descMatch = product.descripcion && product.descripcion.toLowerCase().includes(query);
      
      // Producto pasa si coincide con alguno de los campos
      return nameMatch || descMatch;
    });
  }
  
  // Actualizar los productos filtrados
  filteredProducts = tempProducts;
  
  // Volver a la primera página y re-renderizar
  currentPage = 1;
  updateFilteredProductsCount();
  
  // Actualizar texto de resultados según búsqueda
  updateSearchResultsText();
  
  // Renderizar productos
  renderShopPage(currentPage);
}

/**
 * Actualiza la UI con los filtros activos (etiquetas encima de los productos)
 */
function updateActiveFiltersUI() {
  const container = document.getElementById('active-filters');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Mapeo de IDs a nombres legibles (actualizado con los valores reales de la BD)
  const categoryNames = {
    1: getI18nMessage('shop.men'),
    2: getI18nMessage('shop.women'),
    3: getI18nMessage('shop.kids')
  };
  const subcategoryNames = {
    1: getI18nMessage('shop.abrigos') + ' (' + getI18nMessage('shop.men').charAt(0) + ')',
    2: getI18nMessage('shop.camisetas'),
    3: getI18nMessage('shop.relojes') + ' (' + getI18nMessage('shop.men').charAt(0) + ')',
    4: getI18nMessage('shop.zapatillas') + ' (' + getI18nMessage('shop.men').charAt(0) + ')',
    5: getI18nMessage('shop.abrigos') + ' (' + getI18nMessage('shop.women').charAt(0) + ')',
    6: getI18nMessage('shop.vestidos'),
    7: getI18nMessage('shop.relojes') + ' (' + getI18nMessage('shop.women').charAt(0) + ')',
    8: getI18nMessage('shop.zapatillas') + ' (' + getI18nMessage('shop.women').charAt(0) + ')',
    9: getI18nMessage('shop.chaquetas'),
    10: getI18nMessage('shop.zapatillas') + ' (' + getI18nMessage('shop.kids').charAt(0) + ')'
  };
  
  // Crear tags para categorías
  activeFilters.category.forEach(catId => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      ${categoryNames[catId] || `Categoría ${catId}`}
      <span class="close" data-filter="category" data-id="${catId}">×</span>
    `;
    container.appendChild(tag);
  });
  
  // Crear tags para subcategorías
  activeFilters.subcategory.forEach(subcatId => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      ${subcategoryNames[subcatId] || `Subcategoría ${subcatId}`}
      <span class="close" data-filter="subcategory" data-id="${subcatId}">×</span>
    `;
    container.appendChild(tag);
  });
  
  // Añadir eventos a los botones de cerrar de cada tag
  document.querySelectorAll('.filter-tag .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const filterType = e.target.dataset.filter;
      const id = parseInt(e.target.dataset.id);
      
      // Actualizar array de filtros
      activeFilters[filterType] = activeFilters[filterType].filter(v => v !== id);
      
      // Desmarcar el checkbox correspondiente
      document.querySelector(`input[data-filter="${filterType}"][value="${id}"]`).checked = false;
      
      // Aplicar filtros y actualizar UI
      applySearchAndFilters();
      updateActiveFiltersUI();
      updateFilterBadge();
    });
  });
}

/**
 * Actualiza el contador de filtros activos en el badge del botón
 */
function updateFilterBadge() {
  const badge = document.getElementById('filter-badge');
  if (!badge) return;
  
  const totalFilters = activeFilters.category.length + activeFilters.subcategory.length;
  
  if (totalFilters > 0) {
    badge.textContent = totalFilters;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/**
 * Actualiza el contador de productos filtrados
 */
function updateFilteredProductsCount() {
  const countElement = document.getElementById('total-products-count');
  if (!countElement) return;
  
  countElement.textContent = getI18nMessage('shop.results') + `: ${filteredProducts.length}`;
}

/**
 * Actualiza el texto que muestra el número de resultados de búsqueda
 */
function updateSearchResultsText() {
  const countElement = document.getElementById('total-products-count');
  if (!countElement) return;
  
  if (searchQuery) {
    countElement.textContent = `${filteredProducts.length} ${filteredProducts.length !== 1 ? getI18nMessage('shop.results') : getI18nMessage('shop.results').replace(/s$/, '')} para "${searchQuery}"`;
  } else {
    countElement.textContent = `${getI18nMessage('shop.results')}: ${filteredProducts.length}`;
  }
}

/**
 * renderShopPage(page)
 * Renderiza la vista de productos correspondiente a la página `page`.
 * @param {number} page - Número de página a mostrar
 */
function renderShopPage(page) {
  const container = document.getElementById('shop-list');
  if (!container) return;
  
  container.innerHTML = '';

  // Si no hay productos, mostrar mensaje
  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center my-5">
        <p>${getI18nMessage('shop.noResults')}</p>
        <button class="btn btn-outline-primary" id="clear-filters-btn">${getI18nMessage('shop.clearFilters')}</button>
      </div>
    `;
    
    // Añadir evento al botón de limpiar filtros
    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const clearAllBtn = document.getElementById('clear-all-filters');
        if (clearAllBtn) clearAllBtn.click();
      });
    }
    
    const paginationEl = document.getElementById('shop-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  // Calcular índices de inicio y fin para los productos visibles en la página
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageProducts = filteredProducts.slice(start, end); // Productos de la página

  // Añadir HTML para cada producto
  pageProducts.forEach((prod, index) => {
    const productHTML = buildProductHTML(prod);
    container.innerHTML += productHTML;
    
    // Añadir retraso para animación escalonada
    setTimeout(() => {
      const productElement = container.children[index];
      if (productElement) {
        productElement.classList.add('fade-in');
      }
    }, index * 50); // Cada producto aparece con 50ms de diferencia
  });

  // Renderizar barra de paginación
  renderPagination();
}

/**
 * renderPagination()
 * Renderiza la barra de paginación completa:
 * Botones "Previous", numeración de páginas y "Next"
 */
function renderPagination() {
  let totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginationEl = document.getElementById('shop-pagination');
  if (!paginationEl) return;
  
  paginationEl.innerHTML = '';

  let html = `<ul class="pagination mt-5">`;

  // Botón "Previous"
  html += currentPage === 1
  ? `<li class="page-item disabled"><a class="page-link">${getI18nMessage('general.previous')}</a></li>`
  : `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPage - 1})">${getI18nMessage('general.previous')}</a></li>`;

  // Botones de páginas numeradas
  // Mostrar menos páginas en dispositivos móviles
  const isMobile = window.innerWidth < 768;
  const maxPagesToShow = isMobile ? 3 : 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  // Ajustar el rango si estamos cerca del final
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  // Mostrar siempre la primera página
  if (startPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
    if (startPage > 2) {
      html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
    }
  }
  
  // Páginas numeradas
  for (let i = startPage; i <= endPage; i++) {
    html += i === currentPage
      ? `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
      : `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
  }
  
  // Mostrar siempre la última página
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
    }
    html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
  }

  // Botón "Next"
  html += currentPage === totalPages
  ? `<li class="page-item disabled"><a class="page-link">${getI18nMessage('general.next')}</a></li>`
  : `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPage + 1})">${getI18nMessage('general.next')}</a></li>`;

  html += `</ul>`;
  paginationEl.innerHTML = html;
}

/**
 * changePage(newPage)
 * Cambia el valor de currentPage y vuelve a renderizar productos.
 * @param {number} newPage - Página nueva seleccionada
 */
function changePage(newPage) {
  currentPage = newPage;
  renderShopPage(currentPage);
  // Scroll hacia arriba para mejor experiencia de usuario
  const featuredSection = document.getElementById('featured');
  if (featuredSection) {
    window.scrollTo({
      top: featuredSection.offsetTop - 100,
      behavior: 'smooth'
    });
  }
}

/**
 * buildProductHTML(prod)
 * Construye el HTML para representar visualmente un producto.
 * Incluye control dinámico del botón "Buy Now" y resaltado de términos de búsqueda.
 * Añade animaciones y mejora la estructura para permitir clic en toda la tarjeta.
 * 
 * @param {Object} prod - Objeto producto
 * @returns {string} HTML generado
 */
function buildProductHTML(prod) {
  const { id, nombre, precio, imagenes, stock } = prod;
  const mainImg = imagenes && imagenes.length > 0 ? "../" + imagenes[0] : '../img/noimage.jpg';

  // Controlar el stock restante comparando con el carrito actual
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(i => i.productId === id);
  const remainingStock = item ? stock - item.quantity : stock;

  // Obtener los textos de los botones directamente con la función de traducción
  const buyNowText = getI18nMessage('product.buyNow');
  const outOfStockText = getI18nMessage('product.outOfStock');

  // Mostrar botón adecuado según el stock disponible
  const botonHTML = remainingStock > 0
    ? `<button class="buy-btn" onclick="addToCart(${id}, this)">${buyNowText}</button>`
    : `<button class="buy-btn btn-disabled" disabled>${outOfStockText}</button>`;

  // Verificar si el producto está en la wishlist para mostrar el botón correspondiente
  let isWishlisted = false;
  if (typeof isInWishlist === 'function') {
    isWishlisted = isInWishlist(id);
  }
  
  const wishlistBtnClass = isWishlisted ? 'in-wishlist' : '';
  const wishlistIconClass = isWishlisted ? 'fas' : 'far';
  const wishlistTitle = isWishlisted 
    ? getI18nMessage('wishlist.removeFromWishlist')
    : getI18nMessage('wishlist.addToWishlist');

  // Resaltar términos de búsqueda si hay una búsqueda activa
  let displayNombre = nombre;
  if (searchQuery) {
    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
    displayNombre = nombre.replace(regex, '<span class="highlight">$1</span>');
  }

  return `
    <div class="product text-center col-lg-3 col-md-4 col-12 product-animate">
      <div class="product-wrapper">
        <a href="singleproduct.jsp?id=${id}" class="product-link"></a>
        <div class="product-img-container">
          <img class="img-fluid mb-3 product-img" src="${mainImg}" alt="${nombre}"/>
          <button class="wishlist-btn wishlist-btn-${id} ${wishlistBtnClass}" 
            onclick="toggleWishlist(${id}, event);"
            title="${wishlistTitle}">
            <i class="${wishlistIconClass} fa-heart"></i>
          </button>
        
        </div>
        <div class="star">
          <i class="fa-solid fa-star-sharp" style="color: #989552;"></i>
          <i class="fa-solid fa-star-sharp" style="color: #989552;"></i>
          <i class="fa-solid fa-star-sharp" style="color: #989552;"></i>
          <i class="fa-solid fa-star-sharp" style="color: #989552;"></i>
          <i class="fa-solid fa-star-sharp" style="color: #989552;"></i>
        </div>
        <a href="singleproduct.jsp?id=${id}" class="product-name-link">
          <h5 class="p-name">${displayNombre}</h5>
        </a>
        <h4 class="p-price">${precio.toFixed(2)} €</h4>
        ${botonHTML}
      </div>
    </div>
  `;
}

/**
 * Función auxiliar para escapar caracteres especiales en texto para usar en regex
 * @param {string} str - Texto a escapar
 * @returns {string} - Texto con caracteres especiales escapados
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Añade animaciones a los elementos cuando se carga la página
 */
function animateElementsOnLoad() {
  // Animación para la barra de búsqueda
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    searchContainer.classList.add('animated', 'fadeInDown');
  }

  // Animación para los filtros activos
  const activeFilters = document.getElementById('active-filters');
  if (activeFilters) {
    activeFilters.classList.add('animated', 'fadeIn');
  }

  // Animación para el botón de filtros
  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.classList.add('animated', 'bounceIn');
  }
}

/**
 * goToSingleProduct(productId)
 * Redirige a la página de detalle del producto.
 * @param {number} productId - ID del producto
 */
function goToSingleProduct(productId) {
  window.location.href = `singleproduct.jsp?id=${productId}`;
}

/**
 * addToCart(productId, buttonEl)
 * Añade un producto al carrito (localStorage) y actualiza el estado del botón.
 * Controla automáticamente el stock disponible.
 * 
 * @param {number} productId - ID del producto
 * @param {HTMLElement} buttonEl - Elemento botón "Buy Now" para desactivar si es necesario
 */
function addToCart(productId, buttonEl) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(i => i.productId === productId);
  
  // Buscar en la lista actual de productos (que podría estar filtrada)
  let product = filteredProducts.find(p => p.id === productId);
  
  // Si no lo encuentra en los filtrados, buscarlo en todos los productos
  if (!product) {
    product = allProducts.find(p => p.id === productId);
  }

  if (!product) return showToast(getI18nMessage('error.generalError'));
  if (product.stock <= 0) return showToast(getI18nMessage('product.outOfStock'));

  // Comprobar si ya está en el carrito
  if (item) {
    if (item.quantity + 1 > product.stock) return showToast(getI18nMessage('product.outOfStock'));
    item.quantity++;
    showToast("✅ " + getI18nMessage('cart.update'));
  } else {
    cart.push({ productId, quantity: 1 });
    showToast("✅ " + getI18nMessage('product.addToCart'));
  }

  // Guardar carrito actualizado
  localStorage.setItem('cart', JSON.stringify(cart));

  // Si ya no hay más stock, desactivar botón
  const totalQuantity = cart.find(i => i.productId === productId)?.quantity || 0;
  if (totalQuantity >= product.stock && buttonEl) {
    buttonEl.disabled = true;
    buttonEl.textContent = getI18nMessage('product.outOfStock');
    buttonEl.classList.add("btn-disabled");
  }
  
  // Efecto animado en el botón
  if (buttonEl) {
    buttonEl.classList.add('btn-success-animation');
    setTimeout(() => {
      buttonEl.classList.remove('btn-success-animation');
    }, 1000);
  }
}

/**
 * Muestra un mensaje toast
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
 * Función que se llama cuando se actualiza un filtro
 * Para mantener compatibilidad con el código anterior
 */
function applyFilters() {
  applySearchAndFilters();
}