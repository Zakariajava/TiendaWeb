/**
 * usuario.js - actualizado con sistema i18n centralizado
 * ----------------------------------------------
 * Este script gestiona la visualización de los datos del usuario
 * en la vista de perfil (usuario.jsp), utilizando información
 * almacenada previamente en el localStorage.
 *
 * También permite:
 * - Redirigir a la vista para cambiar datos del usuario
 * - Ir a la gestión de pedidos
 * - Cerrar sesión
 */

document.addEventListener('DOMContentLoaded', () => {
  // Obtener el usuario logueado desde localStorage
  const logged = JSON.parse(localStorage.getItem('loggedUser'));

  // Si no hay sesión iniciada, redirige al login
  if (!logged) {
    window.location.href = 'login.jsp';
    return;
  }

  // Buscar el usuario actual en la lista de usuarios guardados
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let currentUser = users.find(u => u.email === logged.username);

  // Validación: si no se encuentra, cerrar sesión y volver al login
  if (!currentUser) {
    Notify.error(getI18nMessage('error.userNotFound'));
    localStorage.removeItem('loggedUser');
    window.location.href = '../html/login.jsp';
    return;
  }

  // Mostrar los datos del usuario
  displayUserData(currentUser);

  // Botón para ir a cambiar los datos personales
  document.getElementById('btnChange').addEventListener('click', () => {
    window.location.href = '../html/cambiardatos.jsp';
  });

  // Botón para gestionar pedidos realizados
  document.getElementById('btnOrders').addEventListener('click', () => {
    window.location.href = '../html/gestionpedidos.jsp';
  });

  // Botón para cerrar sesión
  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('loggedUser');
    window.location.href = '../html/index.jsp';
  });
  
  // Escuchar cambios de idioma
  document.addEventListener('languageChanged', function() {
    // Actualizar la visualización de datos del usuario con las nuevas traducciones
    if (currentUser) {
      displayUserData(currentUser);
    }
  });
});

/**
 * displayUserData(user)
 * Rellena el contenedor de datos personales del usuario.
 *
 * @param {Object} user - Objeto con los datos del usuario logueado
 */
function displayUserData(user) {
  const container = document.getElementById('user-data');
  if (!container) return;

  // Inserta dinámicamente los datos personales del usuario
  container.innerHTML = `
    <p><strong>${getI18nMessage('register.name')}:</strong> ${user.name}</p>
    <p><strong>${getI18nMessage('register.lastname')}:</strong> ${user.lastname}</p>
    <p><strong>${getI18nMessage('register.address')}:</strong> ${user.address}</p>
    <p><strong>${getI18nMessage('register.city')}:</strong> ${user.city}</p>
    <p><strong>${getI18nMessage('register.province')}:</strong> ${user.province}</p>
    <p><strong>${getI18nMessage('register.zip')}:</strong> ${user.zip}</p>
    <p><strong>${getI18nMessage('register.phone')}:</strong> ${user.phone}</p>
    <p><strong>${getI18nMessage('register.email')}:</strong> ${user.email}</p>
  `;
}