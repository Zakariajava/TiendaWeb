/**
 * singleproduct.js - actualizado con sistema i18n centralizado
 * -----------------------------------------------------------
 * Script encargado de:
 * - Cargar los detalles del producto seleccionado vía AJAX
 * - Mostrar sus imágenes, nombre, categoría, descripción y precio
 * - Permitir añadir una cantidad específica al carrito (con control de stock)
 * - Usar el sistema centralizado de traducciones
 */

let allProducts = []; // Todos los productos (usado para comprobar stock)

document.addEventListener('DOMContentLoaded', () => {
  // Cargar todos los productos para validar stock con precisión
  fetch('../producto-index?ajax=true')
    .then(resp => resp.json())
    .then(data => {
      allProducts = data;
    });

  // Obtener el ID del producto desde la URL
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'), 10);

  // Cargar los datos detallados del producto vía AJAX
  fetch(`../producto-detalle?id=${productId}`)
    .then(resp => {
      if (!resp.ok) throw new Error("Producto no encontrado");
      return resp.json();
    })
    .then(product => displayProduct(product))
    .catch(err => {
      console.error("Error al cargar producto:", err);
      Notify.error(getI18nMessage("error.generalError"));
    });
    
  // Escuchar cambios de idioma para actualizar la UI
  document.addEventListener('languageChanged', function() {
    // Recargar la página para obtener las traducciones actualizadas
    // o actualizar los textos dinámicamente si es posible
    const productId = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
    if (productId) {
      fetch(`../producto-detalle?id=${productId}`)
        .then(resp => resp.json())
        .then(product => displayProduct(product))
        .catch(err => console.error("Error al recargar producto:", err));
    }
  });
});

/**
 * displayProduct(product)
 * Muestra la información del producto en la vista.
 * También gestiona las imágenes, stock y botón de añadir al carrito.
 * Incluye botón de wishlist.
 * 
 * @param {Object} product - Objeto producto cargado desde el backend
 */
function displayProduct(product) {
  // Elementos del DOM que se actualizan
  const mainImgEl = document.getElementById('MainImg');
  const smallImgContainer = document.getElementById('small-img-container');
  const nameEl = document.getElementById('prod-name');
  const categoryEl = document.getElementById('prod-category');
  const priceEl = document.getElementById('prod-price');
  const descEl = document.getElementById('prod-description');
  const addCartBtn = document.getElementById('addCartBtn');
  const quantityInput = document.getElementById('prod-quantity');
  
  // Agregar contenedor para el botón de wishlist
  const wishlistContainer = document.getElementById('wishlist-container');
  if (wishlistContainer) {
    // Verificar si la función isInWishlist existe
    let isWishlisted = false;
    if (typeof isInWishlist === 'function') {
      isWishlisted = isInWishlist(product.id);
    }
    
    const wishlistBtnClass = isWishlisted ? 'in-wishlist' : '';
    const wishlistIconClass = isWishlisted ? 'fas' : 'far';
    const wishlistText = isWishlisted 
      ? getI18nMessage('wishlist.removeFromWishlist')
      : getI18nMessage('wishlist.addToWishlist');
      
    const wishlistAction = isWishlisted 
      ? `toggleWishlist(${product.id})` 
      : `toggleWishlist(${product.id})`;
    
    // Crear el botón de wishlist
    wishlistContainer.innerHTML = `
      <button id="wishlist-toggle" class="wishlist-toggle-btn wishlist-btn-${product.id} ${wishlistBtnClass}" 
              onclick="${wishlistAction}" title="${wishlistText}">
        <i class="${wishlistIconClass} fa-heart"></i>
        <span>${wishlistText}</span>
      </button>
    `;
  }

  // Mostrar información básica
  nameEl.textContent = product.nombre;
  categoryEl.textContent = `${product.category} / ${product.subcategory}`;
  priceEl.textContent = product.precio.toFixed(2) + ' €';
  descEl.textContent = product.descripcion || getI18nMessage('productdetail.descriptionPlaceholder');
  mainImgEl.src = product.imagenes?.length ? "../" + product.imagenes[0] : '../img/noimage.jpg';

  // Renderizado de miniaturas
  smallImgContainer.innerHTML = '';
  if (product.imagenes?.length) {
    product.imagenes.forEach(imgSrc => {
      const finalImg = "../" + imgSrc;
      const div = document.createElement('div');
      div.className = 'small-img-col';
      div.innerHTML = `<img src="${finalImg}" alt="thumb" class="small-img" />`;
      div.addEventListener('click', () => {
        mainImgEl.src = finalImg;
      });
      smallImgContainer.appendChild(div);
    });
  }

  // Verificar stock restante teniendo en cuenta el carrito
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(i => i.productId === product.id);
  const remaining = item ? product.stock - item.quantity : product.stock;

  if (remaining <= 0) {
    // Si no queda stock, desactivar botón y cantidad
    addCartBtn.disabled = true;
    addCartBtn.textContent = getI18nMessage('product.outOfStock');
    addCartBtn.classList.add('btn-disabled');
    quantityInput.disabled = true;
  } else {
    // Si hay stock, activar botón e input
    addCartBtn.textContent = getI18nMessage('product.addToCart');
    addCartBtn.disabled = false;
    quantityInput.disabled = false;

    // Evento para añadir producto al carrito
    addCartBtn.addEventListener('click', () => {
      const qty = parseInt(quantityInput.value, 10);
      if (qty <= 0) {
        Notify.warning(getI18nMessage('error.quantity'));
        return;
      }
      addToCart(product.id, qty, addCartBtn, quantityInput, product.stock);
    });
  }
}

/**
 * addToCart(productId, quantity, button, input, maxStock)
 * Añade una cantidad específica del producto al carrito
 * y actualiza el botón si ya se alcanzó el stock máximo.
 *
 * @param {number} productId - ID del producto
 * @param {number} quantity - Cantidad a añadir
 * @param {HTMLElement} button - Botón de "ADD TO CART"
 * @param {HTMLElement} input - Input de cantidad
 * @param {number} maxStock - Stock total disponible del producto
 */
function addToCart(productId, quantity, button, input, maxStock) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    Notify.error(getI18nMessage("error.generalError"));
    return;
  }

  let item = cart.find(i => i.productId === productId);
  const totalEnCarrito = item ? item.quantity : 0;

  if (totalEnCarrito + quantity > product.stock) {
    Notify.warning(getI18nMessage('product.onlyXLeft', {count: product.stock - totalEnCarrito}));
    return;
  }

  if (item) {
    item.quantity += quantity;
    Notify.success(getI18nMessage('cart.update'));
  } else {
    cart.push({ productId, quantity });
    Notify.success(getI18nMessage('product.addToCart'));
  }

  // Guardar en localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Si se alcanza el límite de stock, desactivar el botón
  if (item?.quantity >= maxStock || (!item && quantity >= maxStock)) {
    button.disabled = true;
    button.textContent = getI18nMessage('product.outOfStock');
    button.classList.add('btn-disabled');
    if (input) input.disabled = true;
  }
  
  // Actualizar contador de carrito si existe
  if (typeof updateMiniCartCounter === 'function') {
    updateMiniCartCounter();
  }
}