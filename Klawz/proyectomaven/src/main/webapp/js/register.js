/**
 * register.js - actualizado con sistema i18n centralizado
 * ---------------------------------------------------------
 * Script que gestiona el registro de usuarios (versión localStorage).
 * 
 * - Recoge los datos del formulario de registro.
 * - Realiza validaciones básicas (campos vacíos, contraseñas, duplicados).
 * - Almacena el nuevo usuario en localStorage.
 * - Redirige al login tras registrar exitosamente.
 */

/**
 * Función principal que se ejecuta al enviar el formulario de registro.
 * 
 * @param {Event} event - Evento de envío del formulario
 */
function doRegister(event) {
  event.preventDefault(); // Prevenir recarga de página

  // Obtener valores del formulario
  const name = document.getElementById('regName').value.trim();
  const lastname = document.getElementById('regLastname').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const city = document.getElementById('regCity').value.trim();
  const province = document.getElementById('regProvince').value.trim();
  const zip = document.getElementById('regZip').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPassword').value.trim();
  const pass2 = document.getElementById('regPassword2').value.trim();

  // Validaciones obligatorias
  if (!name || !lastname || !email || !pass) {
    Notify.warning(getI18nMessage('error.required'));
    return;
  }
  if (pass !== pass2) {
    Notify.error(getI18nMessage('error.passwordMatch'));
    return;
  }

  // Comprobación de email duplicado
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let exists = users.some(u => u.email === email);
  if (exists) {
    Notify.error(getI18nMessage('error.emailExists'));
    return;
  }

  // Crear nuevo usuario
  const newUser = {
    name,
    lastname,
    address,
    city,
    province,
    zip,
    phone,
    email,
    password: pass,
    orders: []
  };

  // Guardar usuario en localStorage
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Confirmación y redirección
  Notify.success(getI18nMessage('success.register'));
  window.location.href = '../html/login.jsp';
}

// Escuchar eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
  // Configurar el formulario de registro si existe
  const registroForm = document.getElementById('registro-form');
  if (registroForm) {
    registroForm.addEventListener('submit', doRegister);
  }
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    // No es necesario hacer nada especial aquí ya que los mensajes
    // se traducen en tiempo real cuando se llama a getI18nMessage()
  });
});