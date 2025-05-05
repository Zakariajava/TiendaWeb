// confirmacion.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('pedidoId');
    
    if (!pedidoId || pedidoId === 'undefined' || isNaN(pedidoId)) {
      document.getElementById('mensaje-error').style.display = 'block';
      document.getElementById('mensaje-exito').style.display = 'none';
      
      // Redireccionar después de 5 segundos
      setTimeout(() => {
        window.location.href = 'shop.jsp';
      }, 5000);
      
      // Animar barra de progreso
      startProgressBar();
    } else {
      document.getElementById('mensaje-error').style.display = 'none';
      document.getElementById('mensaje-exito').style.display = 'block';
      document.getElementById('pedido-id').textContent = pedidoId;
      
      // Limpiar carrito
      localStorage.removeItem('cart');
      sessionStorage.removeItem('pedidoTemp');
      sessionStorage.removeItem('direccionOriginal');
    }
  });
  
  function startProgressBar() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      const progressBar = document.getElementById('redirect-progress');
      if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
      }
      if (progress >= 100) clearInterval(interval);
    }, 50);
  }