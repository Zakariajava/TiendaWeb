<?php
/**
 * Archivo: logout.php
 * -----------------
 * Este archivo se encarga de cerrar la sesión del usuario administrador.
 * Elimina todas las variables de sesión, destruye la sesión actual
 * y redirige al usuario a la página de inicio de sesión.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

session_start();

// Eliminar todas las variables de sesión
session_unset();

// Destruir la sesión
session_destroy();

// Redirigir al login
header('Location: index.php');
exit();
?>