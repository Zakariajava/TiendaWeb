<?php
/**
 * Archivo: cambiar-estado-pedido.php
 * ---------------------------------
 * Página que permite cambiar el estado de un pedido.
 * Permite actualizar un pedido de pendiente a enviado, enviado a entregado,
 * o cancelarlo, con la opción de restaurar el stock de los productos.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Comprobar que se ha recibido un ID por GET o POST
if (isset($_GET['id'])) {
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
} elseif (isset($_POST['id'])) {
    $id = filter_var($_POST['id'], FILTER_VALIDATE_INT);
} else {
    header('Location: pedidos.php');
    exit();
}

if (!$id) {
    header('Location: pedidos.php');
    exit();
}

$mensaje = '';
$error = '';

// Procesar el cambio de estado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger el nuevo estado
    $estado_id = filter_input(INPUT_POST, 'estado_id', FILTER_VALIDATE_INT);
    
    if (!$estado_id) {
        $error = "Por favor, seleccione un estado válido";
    } else {
        // Verificar si el pedido está siendo cancelado 
        $pedido_cancelado = ($estado_id == 4);
        
        // Si el pedido está siendo cancelado, restaurar stock
        if ($pedido_cancelado) {
            // Obtener productos del pedido
            $sql = "SELECT dp.producto_id, dp.cantidad 
                    FROM detalles_pedido dp 
                    WHERE dp.pedido_id = ?";
            $columnas = ['producto_id', 'cantidad'];
            $productos_pedido = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);
            
            // Restaurar stock de cada producto
            foreach ($productos_pedido as $producto) {
                $sql = "UPDATE productos 
                        SET stock = stock + ? 
                        WHERE id = ?";
                BaseDatos::ejecutarOperacion($sql, "ii", [$producto['cantidad'], $producto['producto_id']]);
            }
        }


        $sql = "SELECT estado_id FROM pedidos WHERE id = ?";
        $columnas = ['estado_id'];
        $pedidos_actual = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

        if (count($pedidos_actual) > 0) {
            $estado_actual = $pedidos_actual[0]['estado_id'];
            
            // Si el pedido está siendo cancelado (estado 4)
            if ($estado_id == 4 && $estado_actual != 4) {
                // Restaurar stock (sumar cantidades)
                $sql = "SELECT dp.producto_id, dp.cantidad FROM detalles_pedido dp WHERE dp.pedido_id = ?";
                $columnas = ['producto_id', 'cantidad'];
                $productos_pedido = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);
                
                foreach ($productos_pedido as $producto) {
                    $sql = "UPDATE productos SET stock = stock + ? WHERE id = ?";
                    BaseDatos::ejecutarOperacion($sql, "ii", [$producto['cantidad'], $producto['producto_id']]);
                }
                
                $mensaje = "Estado del pedido actualizado a Cancelado y se ha restaurado el stock de los productos";
            } 
            // Si el pedido estaba cancelado y ahora cambia a otro estado
            else if ($estado_actual == 4 && $estado_id != 4) {
                // Reducir stock nuevamente
                $sql = "SELECT dp.producto_id, dp.cantidad FROM detalles_pedido dp WHERE dp.pedido_id = ?";
                $columnas = ['producto_id', 'cantidad'];
                $productos_pedido = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);
                
                foreach ($productos_pedido as $producto) {
                    $sql = "UPDATE productos SET stock = stock - ? WHERE id = ?";
                    BaseDatos::ejecutarOperacion($sql, "ii", [$producto['cantidad'], $producto['producto_id']]);
                }
                
                $mensaje = "Estado del pedido actualizado correctamente y se ha actualizado el stock de los productos";
            } else {
                $mensaje = "Estado del pedido actualizado correctamente";
            }
        }
        
        // Actualizar el estado del pedido
        $sql = "UPDATE pedidos SET estado_id = ? WHERE id = ?";
        $resultado = BaseDatos::ejecutarOperacion($sql, "ii", [$estado_id, $id]);
        
        if ($resultado !== false) {
            $mensaje = "Estado del pedido actualizado correctamente";
            if ($pedido_cancelado) {
                $mensaje .= " y se ha restaurado el stock de los productos";
            }
            
            // Redirigir a la página de detalles del pedido
            header("Location: ver-pedido.php?id=" . $id . "&mensaje=" . urlencode($mensaje));
            exit();
        } else {
            $error = "Error al actualizar el estado del pedido";
        }
    }
}

// Obtener datos del pedido para el formulario
$sql = "SELECT p.id, p.fecha, p.total, e.id as estado_id, e.nombre as estado, 
              u.nombre as cliente_nombre, u.apellidos as cliente_apellidos
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN estados e ON p.estado_id = e.id
        WHERE p.id = ?";
$columnas = ['id', 'fecha', 'total', 'estado_id', 'estado', 'cliente_nombre', 'cliente_apellidos'];
$pedidos = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

if (count($pedidos) === 0) {
    header('Location: pedidos.php');
    exit();
}

$pedido = $pedidos[0];

// Obtener lista de estados disponibles
$sql = "SELECT id, nombre, descripcion FROM estados ORDER BY id";
$columnas = ['id', 'nombre', 'descripcion'];
$estados = BaseDatos::obtenerFilas($sql, "", [], $columnas);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambiar Estado del Pedido #<?php echo $id; ?> - Administración Klawz</title>
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
                            <a class="nav-link text-white" href="productos.php">
                                <i class="fas fa-box mr-2"></i>Productos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active text-white" href="pedidos.php">
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
                    <h1 class="h2">Cambiar Estado del Pedido #<?php echo $id; ?></h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="ver-pedido.php?id=<?php echo $id; ?>" class="btn btn-sm btn-outline-secondary">
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

                <!-- Información del pedido -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="card-title">Información del Pedido</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Número de Pedido:</div>
                                    <div class="col-sm-8"><?php echo $pedido['id']; ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Fecha:</div>
                                    <div class="col-sm-8"><?php echo date('d/m/Y H:i', strtotime($pedido['fecha'])); ?></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Cliente:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($pedido['cliente_nombre'] . ' ' . $pedido['cliente_apellidos']); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Total:</div>
                                    <div class="col-sm-8"><?php echo number_format($pedido['total'], 2); ?> €</div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Estado Actual:</div>
                                    <div class="col-sm-8">
                                        <span class="badge badge-<?php 
                                            echo ($pedido['estado'] == 'Pendiente') ? 'warning' : 
                                                (($pedido['estado'] == 'Enviado') ? 'primary' : 
                                                    (($pedido['estado'] == 'Entregado') ? 'success' : 'secondary')); 
                                        ?>">
                                            <?php echo $pedido['estado']; ?>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Formulario de cambio de estado -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Cambiar Estado</h3>
                    </div>
                    <div class="card-body">
                        <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                            <input type="hidden" name="id" value="<?php echo $id; ?>">
                            
                            <div class="form-group">
                                <label for="estado_id">Seleccione el nuevo estado:</label>
                                <select class="form-control" id="estado_id" name="estado_id">
                                    <?php foreach ($estados as $estado): ?>
                                    <option value="<?php echo $estado['id']; ?>" <?php echo ($estado['id'] == $pedido['estado_id']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($estado['nombre']); ?> 
                                        <?php if ($estado['descripcion']): ?>
                                            - <?php echo htmlspecialchars($estado['descripcion']); ?>
                                        <?php endif; ?>
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                                
                                <!-- Aviso especial para el estado "Cancelado" -->
                                <div id="cancelacion-aviso" class="alert alert-warning mt-3" style="display: none;">
                                    <strong>Atención:</strong> Al cancelar el pedido, se restaurará automáticamente el stock de los productos. 
                                    Esta acción no se puede deshacer.
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <button type="submit" class="btn btn-primary">Actualizar Estado</button>
                                <a href="ver-pedido.php?id=<?php echo $id; ?>" class="btn btn-secondary">Cancelar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js"></script>
    <script>
        // Mostrar aviso cuando se selecciona el estado "Cancelado"
        $(document).ready(function() {
            // Asumiendo que el estado con ID 5 es "Cancelado"
            const ESTADO_CANCELADO = 5;
            
            $('#estado_id').change(function() {
                if (parseInt($(this).val()) === ESTADO_CANCELADO) {
                    $('#cancelacion-aviso').show();
                } else {
                    $('#cancelacion-aviso').hide();
                }
            });
            
            // Comprobar el estado inicial
            if (parseInt($('#estado_id').val()) === ESTADO_CANCELADO) {
                $('#cancelacion-aviso').show();
            }
        });
    </script>
</body>
</html>