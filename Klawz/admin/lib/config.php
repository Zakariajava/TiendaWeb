<?php
/**
 * Archivo: config.php
 * -------------------
 * Este archivo contiene las configuraciones necesarias para la conexión
 * a la base de datos de la aplicación de administración de Klawz.
 * 
 * Se definen constantes para los parámetros de conexión que serán utilizadas
 * por la clase BaseDatos para establecer la conexión.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

// Servidor de la base de datos
define('DB_HOST', 'localhost');

// Puerto del servidor de base de datos
define('DB_PORT', '3306');

// Nombre de usuario para la conexión
define('DB_USER', 'root');

// Contraseña del usuario para la conexión
define('DB_PASS', 'root');

// Nombre de la base de datos
define('DB_NAME', 'klawz');
?>