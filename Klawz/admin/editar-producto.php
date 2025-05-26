<?php
/**
 * Archivo: editar-producto.php
 * --------------------------
 * Página para editar los datos de un producto.
 * Permite modificar nombre, descripción, precio y stock.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Comprobar que se ha recibido un ID
if (!isset($_GET['id'])) {
    header('Location: productos.php');
    exit();
}

$id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
if (!$id) {
    header('Location: productos.php');
    exit();
}

$mensaje = '';
$error = '';

// Procesar formulario cuando se envía
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger datos del formulario
    $nombre = filter_input(INPUT_POST, 'nombre', FILTER_UNSAFE_RAW);
    $nombre = trim(htmlspecialchars($nombre));
    
    $descripcion = filter_input(INPUT_POST, 'descripcion', FILTER_UNSAFE_RAW);
    $descripcion = trim(htmlspecialchars($descripcion));
    
    $precio = filter_input(INPUT_POST, 'precio', FILTER_VALIDATE_FLOAT);
    $stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT);
    
    // Validar datos
    if (!$nombre || $precio === false || $stock === false) {
        $error = "Por favor, complete todos los campos obligatorios con valores válidos";
    } else {
        // Actualizar producto utilizando consulta preparada
        $sql = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?";
        $resultado = BaseDatos::ejecutarOperacion($sql, "ssdii", [$nombre, $descripcion, $precio, $stock, $id]);
        
        if ($resultado !== false) {
            $mensaje = "Producto actualizado correctamente";
        } else {
            $error = "Error al actualizar el producto";
        }
    }
}

// Obtener datos del producto para el formulario
$sql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.categoria_id, p.subcategoria_id, 
               c.nombre as categoria_nombre, s.nombre as subcategoria_nombre 
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        JOIN subcategorias s ON p.subcategoria_id = s.id
        WHERE p.id = ?";
$columnas = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'categoria_id', 'subcategoria_id', 'categoria_nombre', 'subcategoria_nombre'];
$productos = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

if (count($productos) === 0) {
    header('Location: productos.php');
    exit();
}

$producto = $productos[0];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Producto - Administración Klawz</title>
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
                    <h1 class="h2">Editar Producto</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="productos.php" class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-arrow-left"></i> Volver
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

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Datos del Producto</h3>
                    </div>
                    <div class="card-body">
                        <form method="post" action="editar-producto.php?id=<?php echo $id; ?>">
                            <div class="form-group">
                                <label for="nombre">Nombre *</label>
                                <input type="text" class="form-control" id="nombre" name="nombre" 
                                       value="<?php echo htmlspecialchars($producto['nombre']); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="descripcion">Descripción</label>
                                <textarea class="form-control" id="descripcion" name="descripcion" rows="4"><?php echo htmlspecialchars($producto['descripcion']); ?></textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="categoria">Categoría</label>
                                    <input type="text" class="form-control" id="categoria" 
                                           value="<?php echo htmlspecialchars($producto['categoria_nombre']); ?>" readonly>
                                    <small class="form-text text-muted">La categoría no se puede modificar</small>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="subcategoria">Subcategoría</label>
                                    <input type="text" class="form-control" id="subcategoria" 
                                           value="<?php echo htmlspecialchars($producto['subcategoria_nombre']); ?>" readonly>
                                    <small class="form-text text-muted">La subcategoría no se puede modificar</small>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="precio">Precio (€) *</label>
                                    <input type="number" step="0.01" min="0" class="form-control" id="precio" name="precio" 
                                           value="<?php echo number_format($producto['precio'], 2, '.', ''); ?>" required>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="stock">Stock *</label>
                                    <input type="number" min="0" class="form-control" id="stock" name="stock" 
                                           value="<?php echo $producto['stock']; ?>" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                                <a href="productos.php" class="btn btn-secondary">Cancelar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>