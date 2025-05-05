/**
 * footer.js - actualizado con sistema i18n centralizado
 * ---------------------------------------------------------
 * Este script define un componente web personalizado llamado
 * <mi-footer> que renderiza dinámicamente el pie de página
 * de la tienda Klawz en todas las páginas donde se incluya.
 * 
 * Utiliza la API de Web Components (`customElements.define`)
 * para registrar la clase como etiqueta HTML reutilizable.
 */

class MiFooter extends HTMLElement {
  constructor() {
    super();
    
    // Renderizar el contenido inicial
    this.render();
    
    // Escuchar cambios de idioma
    document.addEventListener('languageChanged', () => {
      this.render(); // Re-render con el nuevo idioma
    });
  }
  
  /**
   * Renderiza el pie de página con las traducciones actuales
   */
  render() {
    // Define el contenido HTML del componente footer
    this.innerHTML = `
      <footer class="mt-5 py-5">
        <div class="row container mx-auto pt-5">
        
          <!-- Columna: Logo + descripción -->
          <div class="footer-one col-lg-3 col-md-6 col-12">
            <img src="../img/logo/logo2.svg" alt="">
            <p>${window.getI18nMessage ? getI18nMessage('general.welcome') : 'En Klawz encontrarás calidad, estilo y comodidad en cada uno de nuestros productos.'}
              ¡Estamos aquí para inspirarte cada día!</p>
          </div>

          <!-- Columna: Enlaces de navegación destacados -->
          <div class="footer-one col-lg-3 col-md-6 col-12 mb-3">
            <h5 class="pb-2">${window.getI18nMessage ? getI18nMessage('home.featured') : 'Featured'}</h5>
            <ul class="text-uppercase list-unstyled">
              <li><a href="#">${window.getI18nMessage ? getI18nMessage('shop.men') : 'men'}</a></li>
              <li><a href="#">${window.getI18nMessage ? getI18nMessage('shop.women') : 'women'}</a></li>
              <li><a href="#">${window.getI18nMessage ? getI18nMessage('shop.kids') : 'boys'}</a></li>
              <li><a href="#">${window.getI18nMessage ? getI18nMessage('home.newArrivals') : 'new arrivals'}</a></li>
              <li><a href="#">${window.getI18nMessage ? getI18nMessage('home.shoes') : 'shoes'}</a></li>
            </ul>
          </div>

          <!-- Columna: Información de contacto -->
          <div class="footer-one col-lg-3 col-md-6 col-12 mb-3">
            <h5 class="pb-2">${window.getI18nMessage ? getI18nMessage('contact.title') : 'Contact Us'}</h5>
            <div>
              <h6 class="text-uppercase">${window.getI18nMessage ? getI18nMessage('contact.address') : 'Address'}</h6>
              <p>Avinguda de l'Universitat, 46100 Burjassot, Valencia</p>
            </div>
            <div>
              <h6 class="text-uppercase">${window.getI18nMessage ? getI18nMessage('contact.phone') : 'Phone'}</h6>
              <p>963 86 41 00</p>
            </div>
            <div>
              <h6 class="text-uppercase">${window.getI18nMessage ? getI18nMessage('contact.email') : 'Email'}</h6>
              <p>abouhamm@alumni.uv.es</p>
            </div>
          </div>

          <!-- Columna: Imágenes de Instagram -->
          <div class="footer-one col-lg-3 col-md-6 col-12">
            <h5 class="pb-2">Instagram</h5>
            <div class="row">
              <img class="img-fluid w-25 h-100 m-2" src="../img/insta/1.jpg" alt="">
              <img class="img-fluid w-25 h-100 m-2" src="../img/insta/2.jpg" alt="">
              <img class="img-fluid w-25 h-100 m-2" src="../img/insta/3.jpg" alt="">
              <img class="img-fluid w-25 h-100 m-2" src="../img/insta/4.jpg" alt="">
              <img class="img-fluid w-25 h-100 m-2" src="../img/insta/5.jpg" alt="">
              <img class="img-fluid w-25 h-100 m-2" src="../img/insta/6.jpg" alt="">
            </div>
          </div>
        </div>

        <!-- Sección inferior con copyright y redes -->
        <div class="copyright mt-5">
          <div class="row container mx-auto">
            <div class="col-lg-3 col-md-6 col-12 mb-4">
              <img src="../img/payment/payment.png" alt="">
            </div>
            <div class="col-lg-4 col-md-6 col-12 text-nowrap mb-2">
              <p>© 2025 Klawz. All Rights Reserved</p>
            </div>
            <div class="col-lg-4 col-md-6 col-12">
              <a href=""><i class="fa-brands fa-facebook"></i></a>
              <a href="https://github.com/Zakariajava?tab=repositories"><i class="fa-brands fa-github"></i></a>
              <a href="https://es.linkedin.com/in/zakaria-abouhammadi-52aa5b1a0"><i class="fa-brands fa-linkedin"></i></a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

/**
 * Registro del componente personalizado <mi-footer>
 * ---------------------------------------------------------
 * Esto permite que en cualquier página HTML se pueda usar
 * <mi-footer></mi-footer> para incluir automáticamente
 * el pie de página definido arriba.
 */
window.customElements.define('mi-footer', MiFooter);