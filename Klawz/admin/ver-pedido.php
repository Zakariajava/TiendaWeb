<?php
/**
 * Archivo: ver-pedido.php
 * ---------------------
 * Página para ver los detalles de un pedido.
 * Muestra la información del pedido, del cliente y los productos incluidos.
 * Permite acceder a la funcionalidad de cambiar el estado del pedido.
 * 
 * @author Zakaria abouhammadi
 * @version 1.1
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Comprobar que se ha recibido un ID
if (!isset($_GET['id'])) {
    header('Location: pedidos.php');
    exit();
}

$id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
if (!$id) {
    header('Location: pedidos.php');
    exit();
}

// Mensaje de éxito
$mensaje = isset($_GET['mensaje']) ? $_GET['mensaje'] : '';
$error = isset($_GET['error']) ? $_GET['error'] : '';

// Obtener datos del pedido
$sql = "SELECT p.id, p.fecha, p.total, e.id as estado_id, e.nombre as estado, 
              u.id as usuario_id, u.nombre, u.apellidos, u.email, u.telefono 
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN estados e ON p.estado_id = e.id
        WHERE p.id = ?";

$columnas = ['id', 'fecha', 'total', 'estado_id', 'estado', 'usuario_id', 'nombre', 'apellidos', 'email', 'telefono'];
$pedidos = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

if (count($pedidos) === 0) {
    header('Location: pedidos.php');
    exit();
}

$pedido = $pedidos[0];

// Obtener dirección de envío
$sql = "SELECT domicilio, poblacion, provincia, cp, telefono 
        FROM direcciones_envio 
        WHERE pedido_id = ?";

$columnas = ['domicilio', 'poblacion', 'provincia', 'cp', 'telefono'];
$direcciones = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);
$direccion = count($direcciones) > 0 ? $direcciones[0] : null;

// Obtener productos del pedido
$sql = "SELECT dp.id, dp.cantidad, dp.precio_unitario, 
              p.id as producto_id, p.nombre, p.descripcion  
        FROM detalles_pedido dp
        JOIN productos p ON dp.producto_id = p.id
        WHERE dp.pedido_id = ?";

$columnas = ['id', 'cantidad', 'precio_unitario', 'producto_id', 'nombre', 'descripcion'];
$detalles = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

// Calcular totales (subtotal y total)
$subtotal = 0;
foreach ($detalles as $detalle) {
    $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
}
$gastos_envio = 5.00; // Valor fijo
$total = $subtotal + $gastos_envio;

// Obtener estados para mostrar en el formulario
$sql = "SELECT id, nombre FROM estados ORDER BY id";
$columnas = ['id', 'nombre'];
$estados = BaseDatos::obtenerFilas($sql, "", [], $columnas);

// Verificar si el pedido está cancelado (estado_id = 5)
$pedido_cancelado = ($pedido['estado_id'] == 4);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalles del Pedido #<?php echo $id; ?> - Administración Klawz</title>
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
                    <h1 class="h2">Detalles del Pedido #<?php echo $id; ?></h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="pedidos.php" class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-arrow-left"></i> Volver
                            </a>
                            <a href="cambiar-estado-pedido.php?id=<?php echo $id; ?>" class="btn btn-sm btn-primary">
                                <i class="fas fa-edit"></i> Cambiar Estado
                            </a>
                            <?php if ($pedido_cancelado): ?>
                            <a href="eliminar-pedido.php?id=<?php echo $id; ?>" class="btn btn-sm btn-danger">
                                <i class="fas fa-trash"></i> Eliminar Pedido
                            </a>
                            <?php endif; ?>
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

                <!-- Resumen del pedido -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Información del Pedido</h3>
                            </div>
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Número de Pedido:</div>
                                    <div class="col-sm-8"><?php echo $pedido['id']; ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Fecha:</div>
                                    <div class="col-sm-8"><?php echo date('d/m/Y H:i', strtotime($pedido['fecha'])); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Estado:</div>
                                    <div class="col-sm-8">
                                        <span class="badge badge-<?php 
                                            echo ($pedido['estado'] == 'Pendiente') ? 'warning' : 
                                                (($pedido['estado'] == 'Enviado') ? 'primary' : 
                                                    (($pedido['estado'] == 'Entregado') ? 'success' : 
                                                        (($pedido['estado'] == 'Cancelado') ? 'danger' : 'secondary'))); 
                                        ?>">
                                            <?php echo $pedido['estado']; ?>
                                        </span>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Total:</div>
                                    <div class="col-sm-8">
                                        <?php 
                                        // Manejar correctamente valores NULL o 0
                                        echo isset($pedido['total']) && $pedido['total'] !== null ? 
                                            number_format($pedido['total'], 2) : '0.00'; 
                                        ?> €
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Información del Cliente</h3>
                            </div>
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Cliente:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($pedido['nombre'] . ' ' . $pedido['apellidos']); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Email:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($pedido['email']); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Teléfono:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($pedido['telefono']); ?></div>
                                </div>
                                <div class="row">
                                    <div class="col-12 text-right">
                                        <a href="editar-usuario.php?id=<?php echo $pedido['usuario_id']; ?>" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-user-edit"></i> Ver Cliente
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dirección de envío -->
                <?php if ($direccion): ?>
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="card-title">Dirección de Envío</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Domicilio:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($direccion['domicilio']); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Población:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($direccion['poblacion']); ?></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Provincia:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($direccion['provincia']); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Código Postal:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($direccion['cp']); ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-sm-4 font-weight-bold">Teléfono:</div>
                                    <div class="col-sm-8"><?php echo htmlspecialchars($direccion['telefono']); ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Detalle de productos -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="card-title">Productos del Pedido</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Producto</th>
                                        <th>Descripción</th>
                                        <th class="text-center">Cantidad</th>
                                        <th class="text-right">Precio Unitario</th>
                                        <th class="text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($detalles as $detalle): ?>
                                    <tr>
                                        <td><?php echo $detalle['producto_id']; ?></td>
                                        <td><?php echo htmlspecialchars($detalle['nombre']); ?></td>
                                        <td><?php echo htmlspecialchars(substr($detalle['descripcion'], 0, 50)) . (strlen($detalle['descripcion']) > 50 ? '...' : ''); ?></td>
                                        <td class="text-center"><?php echo $detalle['cantidad']; ?></td>
                                        <td class="text-right"><?php echo number_format($detalle['precio_unitario'], 2); ?> €</td>
                                        <td class="text-right"><?php echo number_format($detalle['cantidad'] * $detalle['precio_unitario'], 2); ?> €</td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="5" class="text-right font-weight-bold">Subtotal:</td>
                                        <td class="text-right"><?php echo number_format($subtotal, 2); ?> €</td>
                                    </tr>
                                    <tr>
                                        <td colspan="5" class="text-right font-weight-bold">Gastos de envío:</td>
                                        <td class="text-right"><?php echo number_format($gastos_envio, 2); ?> €</td>
                                    </tr>
                                    <tr>
                                        <td colspan="5" class="text-right font-weight-bold">Total:</td>
                                        <td class="text-right font-weight-bold"><?php echo number_format($total, 2); ?> €</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Cambio de estado rápido -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="card-title">Cambiar Estado del Pedido</h3>
                    </div>
                    <div class="card-body">
                        <form method="post" action="cambiar-estado-pedido.php" class="form-inline">
                            <input type="hidden" name="id" value="<?php echo $id; ?>">
                            <div class="form-group mr-2">
                                <label for="estado_id" class="mr-2">Nuevo estado:</label>
                                <select class="form-control" id="estado_id" name="estado_id">
                                    <?php foreach ($estados as $estado): ?>
                                    <option value="<?php echo $estado['id']; ?>" <?php echo ($estado['id'] == $pedido['estado_id']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($estado['nombre']); ?>
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Actualizar Estado</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>