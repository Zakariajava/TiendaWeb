/**
 * cart.js (actualizado con sistema i18n centralizado)
 * ----------------------------------------------------
 * Gestiona el carrito de compras:
 * - Carga y muestra los productos del carrito
 * - Permite actualizar cantidades y eliminar productos
 * - Verifica stock actual antes de permitir avanzar al checkout
 * - Usa el sistema centralizado i18n para traducciones
 */

let allProducts = [];
let currentDiscount = 0;
let shippingCost = 5;

document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos desde el servidor
  fetch('../producto-index?ajax=true')
    .then(resp => resp.json())
    .then(data => {
      allProducts = data;
      renderCartItems();
    })
    .catch(err => {
      console.error('Error al cargar productos:', err);
      Notify.error(getI18nMessage('error.generalError'));
    });

  // Configurar eventos para botones
  document.getElementById('checkoutBtn').addEventListener('click', verificarStockAntesDeCheckout);
  document.getElementById('apply-coupon-btn').addEventListener('click', applyCoupon);
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    // Re-renderizar los elementos con nuevas traducciones
    renderCartItems();
  });
});

/**
 * Renderiza los productos del carrito en la vista
 */
function renderCartItems() {
  const cartTableBody = document.querySelector('#cart-table tbody');
  cartTableBody.innerHTML = '';
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  document.getElementById('checkoutBtn').disabled = cart.length === 0;

  cart.forEach(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (!product || product.stock <= 0) return;

    const subtotal = product.precio * item.quantity;
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><a href="#" onclick="removeItem(${item.productId}); return false;"><i class="fa-solid fa-trash-can"></i></a></td>
      <td><img src="../${product.imagenes[0]}" alt="${product.nombre}" style="width:60px; height:60px; object-fit: cover;"></td>
      <td><h5 class="nombre-producto">${product.nombre}</h5></td>
      <td><h5>${product.precio.toFixed(2)} €</h5></td>
      <td><input type="number" class="w-50" min="1" max="${product.stock}" value="${item.quantity}" onchange="updateQuantity(${item.productId}, this.value)"></td>
      <td><h5 id="subtotal-${item.productId}">${subtotal.toFixed(2)} €</h5></td>
    `;
    cartTableBody.appendChild(tr);
  });

  updateTotals();
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {number} productId - ID del producto
 * @param {string|number} newQty - Nueva cantidad
 */
function updateQuantity(productId, newQty) {
  newQty = parseInt(newQty, 10);
  if (newQty < 1) newQty = 1;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let item = cart.find(i => i.productId === productId);
  const product = allProducts.find(p => p.id === productId);
  if (!product || !item) return;

  if (newQty > product.stock) {
    Notify.warning(getI18nMessage('product.onlyXLeft', {count: product.stock}));
    newQty = product.stock;
    const input = document.querySelector(`input[onchange*="updateQuantity(${productId}"]`);
    if (input) input.value = newQty;
  }

  item.quantity = newQty;
  localStorage.setItem('cart', JSON.stringify(cart));
  document.getElementById(`subtotal-${productId}`).textContent = (product.precio * newQty).toFixed(2) + ' €';
  updateTotals();
  
  // Actualizar mini carrito si existe
  if (typeof updateMiniCartCounter === 'function') {
    updateMiniCartCounter();
  }
  
  Notify.success(getI18nMessage('cart.update'));
}

/**
 * Elimina un producto del carrito
 * @param {number} productId - ID del producto a eliminar
 */
function removeItem(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(i => i.productId !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartItems();
  
  // Actualizar mini carrito si existe
  if (typeof updateMiniCartCounter === 'function') {
    updateMiniCartCounter();
  }
  
  Notify.success(getI18nMessage('cart.remove'));
}

/**
 * Actualiza los totales del carrito
 */
function updateTotals() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let subtotal = 0;
  cart.forEach(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (product) subtotal += product.precio * item.quantity;
  });

  document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2) + ' €';
  document.getElementById('cart-shipping').textContent = shippingCost.toFixed(2) + ' €';
  let total = subtotal + shippingCost - currentDiscount;
  if (total < 0) total = 0;
  document.getElementById('cart-total').textContent = total.toFixed(2) + ' €';
}

/**
 * Aplica un cupón de descuento al carrito
 */
function applyCoupon() {
  const code = document.getElementById('coupon-input').value.trim().toUpperCase();
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    Notify.warning(getI18nMessage('cart.empty'));
    return;
  }

  let subtotal = 0;
  cart.forEach(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (product) subtotal += product.precio * item.quantity;
  });

  if (code === 'DAW') {
    currentDiscount = subtotal * 0.2;
    Notify.success(getI18nMessage('cart.couponApplied'));
  } else {
    currentDiscount = 0;
    Notify.error(getI18nMessage('cart.invalidCoupon'));
  }

  updateTotals();
}

/**
 * Verifica el stock actual antes de proceder al checkout
 */
function verificarStockAntesDeCheckout() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    Notify.warning(getI18nMessage('cart.empty'));
    return;
  }

  fetch('../producto-index?ajax=true')
    .then(resp => resp.json())
    .then(productosBD => {
      let nuevoCarrito = [];
      let cambios = false;

      cart.forEach(item => {
        const productoBD = productosBD.find(p => p.id === item.productId);
        if (!productoBD || productoBD.stock === 0) {
          cambios = true;
          return;
        }

        if (item.quantity > productoBD.stock) {
          item.quantity = productoBD.stock;
          cambios = true;
        }

        nuevoCarrito.push(item);
      });

      if (nuevoCarrito.length === 0) {
        localStorage.removeItem('cart');
        renderCartItems();
        Notify.error(getI18nMessage('cart.noProducts'));
        return;
      }

      if (cambios) {
        localStorage.setItem('cart', JSON.stringify(nuevoCarrito));
        renderCartItems();
        Notify.warning(getI18nMessage('cart.productsAdjusted'));
        return;
      }

      // Verifica sesión y continúa normalmente
      fetch('../verificar-sesion')
        .then(resp => {
          if (resp.status === 200) {
            // Usuario autenticado, redirigir directamente a carrito.jsp
            window.location.href = '../html/carrito.jsp';
          } else {
            // Usuario no autenticado, redirigir a login con parámetro from=carrito
            window.location.href = '../html/login.jsp?from=carrito';
          }
        });
    })
    .catch(err => {
      console.error('Error al verificar stock:', err);
      Notify.error(getI18nMessage('error.generalError'));
    });
}