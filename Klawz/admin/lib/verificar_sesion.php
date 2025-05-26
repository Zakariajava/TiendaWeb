<?php
/**
 * Archivo: verificar_sesion.php
 * ----------------------------
 * Este archivo se encarga de verificar que exista una sesión de
 * administrador válida. Se incluye al principio de todas las páginas
 * del panel de administración para asegurar que solo usuarios
 * autorizados puedan acceder.
 * 
 * Si no hay una sesión válida, redirige automáticamente al login.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

session_start();

// Verificar si existe una sesión de administrador
if (!isset($_SESSION['admin_id'])) {
    // Redirigir al login
    header('Location: index.php');
    exit();
}
?>