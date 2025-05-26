<?php
/**
 * Archivo: nuevo-producto.php
 * -------------------------
 * Página para dar de alta un nuevo producto.
 * Permite ingresar nombre, descripción, categoría, subcategoría,
 * precio y stock del nuevo producto.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

$mensaje = '';
$error = '';

// Obtener lista de categorías
$sql = "SELECT id, nombre FROM categorias ORDER BY nombre";
$columnas = ['id', 'nombre'];
$categorias = BaseDatos::obtenerFilas($sql, "", [], $columnas);

// Procesar formulario cuando se envía
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger datos del formulario
    $nombre = filter_input(INPUT_POST, 'nombre', FILTER_UNSAFE_RAW);
    $nombre = trim(htmlspecialchars($nombre));
    
    $descripcion = filter_input(INPUT_POST, 'descripcion', FILTER_UNSAFE_RAW);
    $descripcion = trim(htmlspecialchars($descripcion));
    
    $categoria_id = filter_input(INPUT_POST, 'categoria_id', FILTER_VALIDATE_INT);
    $subcategoria_id = filter_input(INPUT_POST, 'subcategoria_id', FILTER_VALIDATE_INT);
    $precio = filter_input(INPUT_POST, 'precio', FILTER_VALIDATE_FLOAT);
    $stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT);
    
    // Validar datos
    if (!$nombre || !$categoria_id || !$subcategoria_id || $precio === false || $stock === false) {
        $error = "Por favor, complete todos los campos obligatorios con valores válidos";
    } else {
        // Insertar producto utilizando consulta preparada
        $sql = "INSERT INTO productos (nombre, descripcion, categoria_id, subcategoria_id, precio, stock) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $resultado = BaseDatos::ejecutarOperacion($sql, "ssiidi", [$nombre, $descripcion, $categoria_id, $subcategoria_id, $precio, $stock]);
        
        if ($resultado !== false) {
            // Redirigir a la lista de productos con un mensaje de éxito
            header("Location: productos.php?mensaje=" . urlencode("Producto añadido correctamente"));
            exit();
        } else {
            $error = "Error al añadir el producto";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Producto - Administración Klawz</title>
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
                    <h1 class="h2">Nuevo Producto</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="productos.php" class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-arrow-left"></i> Volver
                            </a>
                        </div>
                    </div>
                </div>

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
                        <h3 class="card-title">Datos del Nuevo Producto</h3>
                    </div>
                    <div class="card-body">
                        <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                            <div class="form-group">
                                <label for="nombre">Nombre *</label>
                                <input type="text" class="form-control" id="nombre" name="nombre" required>
                            </div>

                            <div class="form-group">
                                <label for="descripcion">Descripción</label>
                                <textarea class="form-control" id="descripcion" name="descripcion" rows="4"></textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="categoria_id">Categoría *</label>
                                    <select class="form-control" id="categoria_id" name="categoria_id" required>
                                        <option value="">Seleccione una categoría</option>
                                        <?php foreach ($categorias as $categoria): ?>
                                        <option value="<?php echo $categoria['id']; ?>">
                                            <?php echo htmlspecialchars($categoria['nombre']); ?>
                                        </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="subcategoria_id">Subcategoría *</label>
                                    <select class="form-control" id="subcategoria_id" name="subcategoria_id" required disabled>
                                        <option value="">Primero seleccione una categoría</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="precio">Precio (€) *</label>
                                    <input type="number" step="0.01" min="0" class="form-control" id="precio" name="precio" required>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="stock">Stock *</label>
                                    <input type="number" min="0" class="form-control" id="stock" name="stock" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <button type="submit" class="btn btn-primary">Guardar Producto</button>
                                <a href="productos.php" class="btn btn-secondary">Cancelar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js"></script>
    <script>
        $(document).ready(function() {
            // Cuando cambia la categoría, cargar las subcategorías
            $('#categoria_id').change(function() {
                var categoria_id = $(this).val();
                var subcategoria_select = $('#subcategoria_id');
                
                if (categoria_id !== '') {
                    // Activar el select de subcategorías
                    subcategoria_select.prop('disabled', false);
                    
                    // Limpiar opciones actuales
                    subcategoria_select.empty();
                    subcategoria_select.append('<option value="">Seleccione una subcategoría</option>');
                    
                    // Cargar subcategorías mediante AJAX
                    $.ajax({
                        url: 'obtener_subcategorias.php',
                        type: 'GET',
                        data: { categoria_id: categoria_id },
                        dataType: 'json',
                        success: function(data) {
                            if (data.length > 0) {
                                // Añadir opciones al select
                                $.each(data, function(index, subcategoria) {
                                    subcategoria_select.append('<option value="' + subcategoria.id + '">' + subcategoria.nombre + '</option>');
                                });
                            } else {
                                subcategoria_select.append('<option value="">No hay subcategorías disponibles</option>');
                            }
                        },
                        error: function() {
                            alert('Error al cargar las subcategorías');
                        }
                    });
                } else {
                    // Desactivar el select de subcategorías
                    subcategoria_select.prop('disabled', true);
                    subcategoria_select.empty();
                    subcategoria_select.append('<option value="">Primero seleccione una categoría</option>');
                }
            });
        });
    </script>
</body>
</html>