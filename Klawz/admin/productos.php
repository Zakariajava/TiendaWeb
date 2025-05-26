<?php
/**
 * Archivo: productos.php
 * ---------------------
 * Página de gestión de productos del panel de administración.
 * Permite ver la lista de productos y acceder a la edición de productos
 * y alta de nuevos productos. También permite eliminar productos que
 * no estén en ningún pedido.
 * 
 * @author Zakaria abouhammadi
 * @version 1.1
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Mensaje de éxito
$mensaje = isset($_GET['mensaje']) ? $_GET['mensaje'] : '';
$error = isset($_GET['error']) ? $_GET['error'] : '';

// Obtener lista de productos
$sql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.categoria_id, p.subcategoria_id, 
               c.nombre as categoria, s.nombre as subcategoria 
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        JOIN subcategorias s ON p.subcategoria_id = s.id
        ORDER BY p.nombre";

$columnas = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'categoria_id', 'subcategoria_id', 'categoria', 'subcategoria'];
$productos = BaseDatos::obtenerFilas($sql, "", [], $columnas);

// Verificar qué productos están en pedidos (para mostrar/ocultar botón eliminar)
foreach ($productos as &$producto) {
    $producto['en_pedidos'] = BaseDatos::productoEnPedidos($producto['id']);
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Productos - Administración Klawz</title>
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
                    <h1 class="h2">Gestión de Productos</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="nuevo-producto.php" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-plus"></i> Nuevo Producto
                            </a>
                        </div>
                    </div>
                </div>

                <?php if ($mensaje): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <?php echo $mensaje; ?>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <?php endif; ?>

                <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <?php echo $error; ?>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <?php endif; ?>

                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead class="thead-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Subcategoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($productos as $producto): ?>
                            <tr>
                                <td><?php echo $producto['id']; ?></td>
                                <td><?php echo htmlspecialchars($producto['nombre']); ?></td>
                                <td><?php echo htmlspecialchars(substr($producto['descripcion'], 0, 50)) . (strlen($producto['descripcion']) > 50 ? '...' : ''); ?></td>
                                <td><?php echo htmlspecialchars($producto['categoria']); ?></td>
                                <td><?php echo htmlspecialchars($producto['subcategoria']); ?></td>
                                <td><?php echo number_format($producto['precio'], 2); ?> €</td>
                                <td><?php echo $producto['stock']; ?></td>
                                <td>
                                    <div class="btn-group">
                                        <a href="editar-producto.php?id=<?php echo $producto['id']; ?>" 
                                           class="btn btn-sm btn-primary">
                                            <i class="fas fa-edit"></i> Editar
                                        </a>
                                        
                                        <?php if (!$producto['en_pedidos']): ?>
                                        <a href="eliminar-producto.php?id=<?php echo $producto['id']; ?>" 
                                           class="btn btn-sm btn-danger ml-1">
                                            <i class="fas fa-trash"></i> Eliminar
                                        </a>
                                        <?php else: ?>
                                        <button type="button" class="btn btn-sm btn-secondary ml-1" 
                                                title="No se puede eliminar porque está en uno o más pedidos" disabled>
                                            <i class="fas fa-trash"></i> Eliminar
                                        </button>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>