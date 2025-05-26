<?php
/**
 * Archivo: eliminar-producto.php
 * ----------------------------
 * Página para eliminar un producto del sistema.
 * Solo permite eliminar productos que no están en ningún pedido.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Comprobar que se ha recibido un ID
if (!isset($_GET['id'])) {
    header('Location: productos.php?error=' . urlencode("ID de producto no especificado"));
    exit();
}

$id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
if (!$id) {
    header('Location: productos.php?error=' . urlencode("ID de producto no válido"));
    exit();
}

// Verificar que el producto no está en ningún pedido
if (BaseDatos::productoEnPedidos($id)) {
    header('Location: productos.php?error=' . urlencode("No se puede eliminar el producto porque está en uno o más pedidos"));
    exit();
}

// Confirmar eliminación
$confirmado = isset($_GET['confirmar']) && $_GET['confirmar'] == '1';

if ($confirmado) {
    // Eliminar el producto (en cascada también se eliminarán las imágenes gracias a las restricciones FK)
    $sql = "DELETE FROM productos WHERE id = ?";
    $resultado = BaseDatos::ejecutarOperacion($sql, "i", [$id]);
    
    if ($resultado !== false) {
        header('Location: productos.php?mensaje=' . urlencode("Producto eliminado correctamente"));
    } else {
        header('Location: productos.php?error=' . urlencode("Error al eliminar el producto"));
    }
    exit();
}

// Obtener datos del producto para mostrar confirmación
$sql = "SELECT nombre, precio FROM productos WHERE id = ?";
$columnas = ['nombre', 'precio'];
$productos = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

if (count($productos) === 0) {
    header('Location: productos.php?error=' . urlencode("Producto no encontrado"));
    exit();
}

$producto = $productos[0];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eliminar Producto - Administración Klawz</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-2 d-none d-md-block bg-dark sidebar">
                <div class="sidebar-sticky pt-3">
                    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-white">
                        <span>Administración</span>
                    </h6>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link text-white" href="dashboard.php">
                                <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="usuarios.php">
                                <i class="fas fa-users mr-2"></i>Usuarios
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active text-white" href="productos.php">
                                <i class="fas fa-box mr-2"></i>Productos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="pedidos.php">
                                <i class="fas fa-shopping-cart mr-2"></i>Pedidos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="mensajes.php">
                                <i class="fas fa-envelope mr-2"></i>Mensajes
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="logout.php">
                                <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Contenido principal -->
            <main role="main" class="col-md-10 ml-sm-auto px-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Eliminar Producto</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="productos.php" class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-arrow-left"></i> Volver
                            </a>
                        </div>
                    </div>
                </div>

                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">¡Atención! Esta acción no se puede deshacer</h4>
                    <p>Está a punto de eliminar el producto <strong><?php echo htmlspecialchars($producto['nombre']); ?></strong> 
                    con precio <strong><?php echo number_format($producto['precio'], 2); ?> €</strong>.</p>
                    <p>Esta acción eliminará permanentemente el producto y todas sus imágenes asociadas.</p>
                    <hr>
                    <p class="mb-0">¿Está seguro de que desea continuar?</p>
                </div>
                
                <div class="mt-4">
                    <a href="eliminar-producto.php?id=<?php echo $id; ?>&confirmar=1" class="btn btn-danger mr-2">
                        <i class="fas fa-trash"></i> Sí, eliminar producto
                    </a>
                    <a href="productos.php" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Cancelar
                    </a>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>