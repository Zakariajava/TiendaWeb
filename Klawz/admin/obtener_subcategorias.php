<?php
/**
 * Archivo: obtener_subcategorias.php
 * --------------------------------
 * Script AJAX que devuelve las subcategorías correspondientes
 * a una categoría determinada en formato JSON.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Validar entrada
$categoria_id = filter_input(INPUT_GET, 'categoria_id', FILTER_VALIDATE_INT);

if (!$categoria_id) {
    echo json_encode([]);
    exit();
}

// Consultar subcategorías usando el patrón de consulta de la práctica
$sql = "SELECT id, nombre FROM subcategorias WHERE categoria_id = ? ORDER BY nombre";
$columnas = ['id', 'nombre'];
$subcategorias = BaseDatos::obtenerFilas($sql, "i", [$categoria_id], $columnas);

// Devolver como JSON
header('Content-Type: application/json');
echo json_encode($subcategorias);
?>