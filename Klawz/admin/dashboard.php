<?php
/**
 * Archivo: dashboard.php
 * ---------------------
 * Panel principal de la aplicación de administración.
 * Muestra un resumen de la información más relevante:
 * - Total de usuarios
 * - Total de productos
 * - Total de pedidos
 * - Pedidos pendientes
 * - Mensajes no leídos
 * - Listado de los últimos pedidos recibidos
 * 
 * @author Zakaria abouhammadi
 * @version 1.1
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Variables para almacenar los resultados de las consultas
$total_usuarios = 0;
$total_productos = 0;
$total_pedidos = 0;
$pedidos_pendientes = 0;
$mensajes_no_leidos = 0;

// Total de usuarios (excluyendo administradores)
$sql = "SELECT COUNT(*) FROM usuarios WHERE admin = 0";
$resultados = array(&$total_usuarios);
BaseDatos::ejecutarConsultaConValor($sql, "", [], $resultados);

// Total de productos
$sql = "SELECT COUNT(*) FROM productos";
$resultados = array(&$total_productos);
BaseDatos::ejecutarConsultaConValor($sql, "", [], $resultados);

// Total de pedidos
$sql = "SELECT COUNT(*) FROM pedidos";
$resultados = array(&$total_pedidos);
BaseDatos::ejecutarConsultaConValor($sql, "", [], $resultados);

// Pedidos pendientes (estado_id = 1 es "pendiente" según la base de datos)
$sql = "SELECT COUNT(*) FROM pedidos WHERE estado_id = 1";
$resultados = array(&$pedidos_pendientes);
BaseDatos::ejecutarConsultaConValor($sql, "", [], $resultados);

// Mensajes no leídos
$sql = "SELECT COUNT(*) FROM mensajes WHERE leido = 0";
$resultados = array(&$mensajes_no_leidos);
BaseDatos::ejecutarConsultaConValor($sql, "", [], $resultados);

// Obtener los últimos 5 pedidos
$sql = "SELECT p.id, p.fecha, p.total, e.nombre as estado_nombre, u.nombre, u.apellidos 
        FROM pedidos p 
        JOIN usuarios u ON p.usuario_id = u.id 
        JOIN estados e ON p.estado_id = e.id 
        ORDER BY p.fecha DESC LIMIT 5";

$columnas = ['id', 'fecha', 'total', 'estado_nombre', 'nombre', 'apellidos'];
$ultimos_pedidos = BaseDatos::obtenerFilas($sql, "", [], $columnas);

// Obtener los últimos 3 mensajes no leídos
$sql = "SELECT id, nombre, email, contenido, fecha_recepcion 
        FROM mensajes 
        WHERE leido = 0 
        ORDER BY fecha_recepcion DESC LIMIT 3";

$columnas = ['id', 'nombre', 'email', 'contenido', 'fecha_recepcion'];
$ultimos_mensajes = BaseDatos::obtenerFilas($sql, "", [], $columnas);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Administración Klawz</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar - Menú lateral -->
            <nav class="col-md-2 d-none d-md-block bg-dark sidebar">
                <div class="sidebar-sticky pt-3">
                    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-white">
                        <span>Administración</span>
                    </h6>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active text-white" href="dashboard.php">
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
                            <a class="nav-link text-white" href="pedidos.php">
                                <i class="fas fa-shopping-cart mr-2"></i>Pedidos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="mensajes.php">
                                <i class="fas fa-envelope mr-2"></i>Mensajes
                                <?php if ($mensajes_no_leidos > 0): ?>
                                <span class="badge badge-pill badge-danger"><?php echo $mensajes_no_leidos; ?></span>
                                <?php endif; ?>
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
                    <h1 class="h2">Dashboard</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="nuevo-producto.php" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-plus"></i> Nuevo Producto
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Tarjetas con estadísticas -->
                <div class="row">
                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                            Usuarios</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $total_usuarios; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-users fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-success shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                            Productos</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $total_productos; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-box fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-info shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                            Pedidos Totales</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $total_pedidos; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-shopping-cart fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-warning shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                            Pedidos Pendientes</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $pedidos_pendientes; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-clock fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fila con mensajes no leídos y últimos pedidos -->
                <div class="row">
                    <!-- Últimos pedidos -->
                    <div class="col-lg-8">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Últimos Pedidos</h6>
                                <a href="pedidos.php" class="btn btn-sm btn-primary">
                                    Ver todos
                                </a>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Cliente</th>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($ultimos_pedidos as $pedido): ?>
                                            <tr>
                                                <td><?php echo $pedido['id']; ?></td>
                                                <td><?php echo $pedido['nombre'] . ' ' . $pedido['apellidos']; ?></td>
                                                <td><?php echo date('d/m/Y', strtotime($pedido['fecha'])); ?></td>
                                                <td><?php echo $pedido['total'] . ' €'; ?></td>
                                                <td>
                                                    <span class="badge badge-<?php 
                                                        echo ($pedido['estado_nombre'] == 'Pendiente') ? 'warning' : 
                                                            (($pedido['estado_nombre'] == 'Enviado') ? 'primary' : 
                                                                (($pedido['estado_nombre'] == 'Entregado') ? 'success' : 
                                                                    (($pedido['estado_nombre'] == 'Cancelado') ? 'danger' : 'secondary'))); 
                                                    ?>">
                                                        <?php echo $pedido['estado_nombre']; ?>
                                                    </span>
                                                </td>
                                                <td>
                                                    <a href="ver-pedido.php?id=<?php echo $pedido['id']; ?>" class="btn btn-sm btn-info">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mensajes no leídos -->
                    <div class="col-lg-4">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">
                                    Mensajes no leídos
                                    <?php if ($mensajes_no_leidos > 0): ?>
                                    <span class="badge badge-danger"><?php echo $mensajes_no_leidos; ?></span>
                                    <?php endif; ?>
                                </h6>
                                <a href="mensajes.php" class="btn btn-sm btn-primary">
                                    Ver todos
                                </a>
                            </div>
                            <div class="card-body">
                                <?php if (count($ultimos_mensajes) > 0): ?>
                                    <?php foreach ($ultimos_mensajes as $msg): ?>
                                    <div class="media mb-3 border-bottom pb-3">
                                        <div class="media-body">
                                            <h5 class="mt-0"><?php echo htmlspecialchars($msg['nombre']); ?></h5>
                                            <p class="text-muted mb-1"><?php echo htmlspecialchars($msg['email']); ?></p>
                                            <p class="mb-0"><?php echo htmlspecialchars(substr($msg['contenido'], 0, 100)) . (strlen($msg['contenido']) > 100 ? '...' : ''); ?></p>
                                            <div class="d-flex justify-content-between align-items-center mt-2">
                                                <small class="text-muted"><?php echo date('d/m/Y H:i', strtotime($msg['fecha_recepcion'])); ?></small>
                                                <a href="mensajes.php?accion=leer&id=<?php echo $msg['id']; ?>" class="btn btn-sm btn-success">
                                                    <i class="fas fa-check"></i> Marcar como leído
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <div class="text-center py-4">
                                        <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                                        <p class="mb-0">No tienes mensajes sin leer</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>