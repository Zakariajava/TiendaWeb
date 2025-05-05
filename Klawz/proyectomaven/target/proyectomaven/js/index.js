/**
 * index.js - versión actualizada con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script principal de la página de inicio (index.jsp) de Klawz.
 * 
 * - Cambia dinámicamente el fondo de la sección principal con imágenes animadas.
 * - Carga los productos desde la base de datos vía AJAX.
 * - Muestra productos destacados, vestidos, relojes y zapatillas.
 * - Controla los botones de "Buy Now" en función del stock disponible.
 */

let allProducts = [];

/**
 * Evento que se ejecuta al cargar completamente el DOM.
 * - Gestiona el cambio automático de fondo con imágenes.
 * - Llama al endpoint para obtener los productos y los renderiza.
 */
document.addEventListener('DOMContentLoaded', () => {
  const bgImages = [
    '../img/backgroundMain/back2.jpg',
    '../img/backgroundMain/back1.jpg',
    '../img/backgroundMain/back3.jpg'
  ];

  let currentBg = 0;
  const homeSection = document.getElementById('home');
  if (homeSection) {
    const overlay = document.createElement('div');
    overlay.className = 'bg-overlay';
    homeSection.appendChild(overlay);
    const progressLine = document.createElement('div');
    progressLine.className = 'progress-line';
    homeSection.appendChild(progressLine);

    // Precarga la primera imagen para evitar parpadeo
    const initialImg = new Image();
    initialImg.src = bgImages[0];
    initialImg.onload = () => {
      homeSection.style.backgroundImage = `url(${bgImages[0]})`;
      startProgress();
    };
    initialImg.onerror = () => console.error('Error al cargar la imagen inicial', bgImages[0]);

    /**
     * Inicia la animación de la barra de progreso del fondo.
     */
    function startProgress() {
      progressLine.style.transition = 'none';
      progressLine.style.width = '0';
      progressLine.offsetWidth; // forzar repaint
      progressLine.style.transition = 'width 5s linear';
      progressLine.style.width = '100%';
    }

    /**
     * Cambia la imagen de fondo tras completar la barra de progreso.
     * - Usa una superposición con transición suave.
     */
    function changeBackground() {
      currentBg = (currentBg + 1) % bgImages.length;
      const nextImage = bgImages[currentBg];
      const img = new Image();
      img.src = nextImage;
      img.onload = () => {
        overlay.style.backgroundImage = `url(${nextImage})`;
        overlay.style.opacity = 1;
        setTimeout(() => {
          homeSection.style.backgroundImage = `url(${nextImage})`;
          overlay.style.opacity = 0;
          startProgress();
        }, 1000);
      };
      img.onerror = () => {
        console.error('Error al cargar la imagen', nextImage);
        startProgress();
      };
    }

    // Detectar fin de animación para cambiar imagen
    progressLine.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'width' && progressLine.style.width === '100%') {
        changeBackground();
      }
    });
  }

  // Llamada al backend para obtener los productos
  fetch('../producto-index?ajax=true')
    .then((response) => response.json())
    .then((products) => {
      allProducts = products;
      renderFeatured(products);
      renderDresses(products);
      renderWatches(products);
      renderShoes(products);
    })
    .catch((error) => console.error('Error loading products:', error));
    
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    renderFeatured(allProducts);
    renderDresses(allProducts);
    renderWatches(allProducts);
    renderShoes(allProducts);
  });
});

/**
 * Renderiza productos destacados en la sección correspondiente.
 */
function renderFeatured(products) {
  const container = document.getElementById('featured-list');
  if (!container) return;
  
  container.innerHTML = '';
  products.filter(p => p.destacado).slice(0, 4).forEach(p => container.innerHTML += buildProductHTML(p));
}

/**
 * Renderiza productos de tipo vestido (mujer, subcategoría 6).
 */
function renderDresses(products) {
  const container = document.getElementById('dresses-list');
  if (!container) return;
  
  container.innerHTML = '';
  products.filter(p => p.categoriaId === 2 && p.subcategoriaId === 6).slice(0, 4).forEach(p => container.innerHTML += buildProductHTML(p));
}

/**
 * Renderiza productos de tipo reloj (subcategorías 3 y 7).
 */
function renderWatches(products) {
  const container = document.getElementById('watches-list');
  if (!container) return;
  
  container.innerHTML = '';
  products.filter(p => p.subcategoriaId === 3 || p.subcategoriaId === 7).slice(0, 4).forEach(p => container.innerHTML += buildProductHTML(p));
}

/**
 * Renderiza productos de tipo zapatillas (subcategorías 4 y 8).
 */
function renderShoes(products) {
  const container = document.getElementById('shoes-list');
  if (!container) return;
  
  container.innerHTML = '';
  products.filter(p => p.subcategoriaId === 4 || p.subcategoriaId === 8).slice(0, 4).forEach(p => container.innerHTML += buildProductHTML(p));
}

/**
 * Construye el HTML de un producto individual.
 * - Controla el botón según el stock disponible y la cantidad en el carrito.
 * 
 * @param {Object} prod - Objeto producto
 * @returns {string} - HTML del producto
 */
function buildProductHTML(prod) {
  const { id, nombre, precio, imagenes, stock } = prod;
  const mainImg = imagenes && imagenes.length > 0 ? "../" + imagenes[0] : '../img/noimage.jpg';

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(i => i.productId === id);
  const remainingStock = item ? stock - item.quantity : stock;

  // Verificar si el producto está en la wishlist
  let isWishlisted = false;
  if (typeof isInWishlist === 'function') {
    isWishlisted = isInWishlist(id);
  }
  
  const wishlistBtnClass = isWishlisted ? 'in-wishlist' : '';
  const wishlistIconClass = isWishlisted ? 'fas' : 'far';
  const wishlistTitle = isWishlisted ? 
    getI18nMessage('wishlist.removeFromWishlist') : 
    getI18nMessage('wishlist.addToWishlist');

  // Obtener los textos de los botones directamente con la función de traducción
  const buyNowText = getI18nMessage('product.buyNow');
  const outOfStockText = getI18nMessage('product.outOfStock');

  const botonHTML = remainingStock > 0
    ? `<button class="buy-btn" onclick="addToCart(${id}, this)">${buyNowText}</button>`
    : `<button class="buy-btn btn-disabled" disabled>${outOfStockText}</button>`;

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
          <h5 class="p-name">${nombre}</h5>
        </a>
        <h4 class="p-price">${precio.toFixed(2)} €</h4>
        ${botonHTML}
      </div>
    </div>
  `;
}

/**
 * Redirige al usuario a la página de detalle del producto seleccionado.
 * @param {number} id - ID del producto
 */
function goToSingleProduct(id) {
  window.location.href = `singleproduct.jsp?id=${id}`;
}

/**
 * Añade un producto al carrito y actualiza el botón si ya no hay más stock.
 * 
 * @param {number} productId - ID del producto
 * @param {HTMLElement} buttonEl - Botón que fue clicado (opcional)
 */
function addToCart(productId, buttonEl) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(i => i.productId === productId);
  const product = allProducts.find(p => p.id === productId);
  if (!product) return Notify.error(getI18nMessage('error.productNotFound'));
  if (product.stock <= 0) return Notify.warning(getI18nMessage('product.outOfStock'));

  if (item) {
    if (item.quantity + 1 > product.stock) return Notify.warning(getI18nMessage('product.outOfStock'));
    item.quantity++;
    Notify.success(getI18nMessage('cart.update'));
  } else {
    cart.push({ productId, quantity: 1 });
    Notify.success(getI18nMessage('product.addToCart'))
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  const totalQuantity = cart.find(i => i.productId === productId)?.quantity || 0;
  if (totalQuantity >= product.stock && buttonEl) {
    buttonEl.disabled = true;
    buttonEl.textContent = getI18nMessage('product.outOfStock');
    buttonEl.classList.add("btn-disabled");
  }
}