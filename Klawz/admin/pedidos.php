
<?php
/**
 * Archivo: pedidos.php
 * ------------------
 * Página de gestión de pedidos del panel de administración.
 * Permite ver la lista de pedidos, filtrarlos por usuario, producto
 * o fecha, y acceder a la vista detallada y cambio de estado.
 * Incluye la posibilidad de combinar filtros con operadores AND/OR.
 * 
 * @author Zakaria abouhammadi
 * @version 1.1
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

$mensaje = isset($_GET['mensaje']) ? $_GET['mensaje'] : '';
$error = isset($_GET['error']) ? $_GET['error'] : '';

// Filtros
$filtro_usuario = filter_input(INPUT_GET, 'usuario_id', FILTER_VALIDATE_INT);
$filtro_producto = filter_input(INPUT_GET, 'producto_id', FILTER_VALIDATE_INT);
$filtro_fecha = filter_input(INPUT_GET, 'fecha', FILTER_UNSAFE_RAW);
$filtro_fecha_comp = filter_input(INPUT_GET, 'fecha_comp', FILTER_UNSAFE_RAW) ?: 'igual';
$operador_logico = filter_input(INPUT_GET, 'operador', FILTER_UNSAFE_RAW) ?: 'AND'; // AND por defecto

// Obtener lista de usuarios para el filtro
$sql = "SELECT id, nombre, apellidos FROM usuarios WHERE admin = 0 ORDER BY apellidos, nombre";
$columnas = ['id', 'nombre', 'apellidos'];
$usuarios = BaseDatos::obtenerFilas($sql, "", [], $columnas);

// Obtener lista de productos para el filtro
$sql = "SELECT id, nombre FROM productos ORDER BY nombre";
$columnas = ['id', 'nombre'];
$productos = BaseDatos::obtenerFilas($sql, "", [], $columnas);

// Construir consulta con filtros
$sql_base = "SELECT DISTINCT p.id, p.fecha, p.total, e.nombre as estado, e.id as estado_id,
                    u.id as usuario_id, u.nombre, u.apellidos
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN estados e ON p.estado_id = e.id";

$where_clauses = [];
$params = [];
$tipos = "";

// Si hay filtro de producto, agregamos JOIN para detalles_pedido
if ($filtro_producto) {
    $sql_base .= " JOIN detalles_pedido dp ON p.id = dp.pedido_id";
}

// Añadir filtros si están presentes
if ($filtro_usuario) {
    $where_clauses[] = "p.usuario_id = ?";
    $params[] = $filtro_usuario;
    $tipos .= "i";
}

if ($filtro_producto) {
    $where_clauses[] = "dp.producto_id = ?";
    $params[] = $filtro_producto;
    $tipos .= "i";
}

if ($filtro_fecha) {
    switch ($filtro_fecha_comp) {
        case 'menor_igual':
            $where_clauses[] = "DATE(p.fecha) <= ?";
            break;
        case 'mayor_igual':
            $where_clauses[] = "DATE(p.fecha) >= ?";
            break;
        default: // igual
            $where_clauses[] = "DATE(p.fecha) = ?";
            break;
    }
    $params[] = $filtro_fecha;
    $tipos .= "s";
}

// Completar la consulta con los filtros usando el operador lógico seleccionado
if (!empty($where_clauses)) {
    $sql_base .= " WHERE " . implode(" $operador_logico ", $where_clauses);
}

$sql_base .= " ORDER BY p.fecha DESC";

// Ejecutar la consulta
$columnas = ['id', 'fecha', 'total', 'estado', 'estado_id', 'usuario_id', 'nombre', 'apellidos'];
$pedidos = BaseDatos::obtenerFilas($sql_base, $tipos, $params, $columnas);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Pedidos - Administración Klawz</title>
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
                    <h1 class="h2">Gestión de Pedidos</h1>
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

                <!-- Filtros -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title mb-0">Filtros de Búsqueda</h3>
                    </div>
                    <div class="card-body">
                        <form method="get" action="<?php echo $_SERVER['PHP_SELF']; ?>" class="row">
                            <div class="form-group col-md-3">
                                <label for="usuario_id">Usuario</label>
                                <select class="form-control" id="usuario_id" name="usuario_id">
                                    <option value="">Todos los usuarios</option>
                                    <?php foreach ($usuarios as $usuario): ?>
                                    <option value="<?php echo $usuario['id']; ?>" <?php echo ($filtro_usuario == $usuario['id']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($usuario['nombre'] . ' ' . $usuario['apellidos']); ?>
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group col-md-3">
                                <label for="producto_id">Producto</label>
                                <select class="form-control" id="producto_id" name="producto_id">
                                    <option value="">Todos los productos</option>
                                    <?php foreach ($productos as $producto): ?>
                                    <option value="<?php echo $producto['id']; ?>" <?php echo ($filtro_producto == $producto['id']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($producto['nombre']); ?>
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group col-md-3">
                                <label for="fecha_comp">Fecha</label>
                                <div class="input-group">
                                    <select class="form-control" id="fecha_comp" name="fecha_comp">
                                        <option value="igual" <?php echo ($filtro_fecha_comp == 'igual') ? 'selected' : ''; ?>>Igual a</option>
                                        <option value="menor_igual" <?php echo ($filtro_fecha_comp == 'menor_igual') ? 'selected' : ''; ?>>Menor o igual a</option>
                                        <option value="mayor_igual" <?php echo ($filtro_fecha_comp == 'mayor_igual') ? 'selected' : ''; ?>>Mayor o igual a</option>
                                    </select>
                                    <input type="date" class="form-control" id="fecha" name="fecha" value="<?php echo $filtro_fecha; ?>">
                                </div>
                            </div>
                            
                            <div class="form-group col-md-3">
                                <label for="operador">Operador lógico</label>
                                <select class="form-control" id="operador" name="operador">
                                    <option value="AND" <?php echo ($operador_logico == 'AND') ? 'selected' : ''; ?>>Y (AND - Cumplir todos los filtros)</option>
                                    <option value="OR" <?php echo ($operador_logico == 'OR') ? 'selected' : ''; ?>>O (OR - Cumplir al menos un filtro)</option>
                                </select>
                            </div>
                            
                            <div class="form-group col-md-12 d-flex justify-content-end">
                                <button type="submit" class="btn btn-primary mr-2">
                                    <i class="fas fa-search"></i> Filtrar
                                </button>
                                <a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="btn btn-secondary">
                                    <i class="fas fa-sync-alt"></i> Limpiar
                                </a>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Listado de pedidos -->
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead class="thead-dark">
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
                            <?php if (count($pedidos) > 0): ?>
                                <?php foreach ($pedidos as $pedido): ?>
                                <tr>
                                    <td><?php echo $pedido['id']; ?></td>
                                    <td><?php echo htmlspecialchars($pedido['nombre'] . ' ' . $pedido['apellidos']); ?></td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($pedido['fecha'])); ?></td>
                                    <td><?php echo isset($pedido['total']) && $pedido['total'] !== null ? number_format($pedido['total'], 2) : '0.00'; ?> €</td>
                                    <td>
                                        <span class="badge badge-<?php 
                                            echo ($pedido['estado'] == 'Pendiente') ? 'warning' : 
                                                (($pedido['estado'] == 'Enviado') ? 'primary' : 
                                                    (($pedido['estado'] == 'Entregado') ? 'success' : 
                                                        (($pedido['estado'] == 'Cancelado') ? 'danger' : 'secondary'))); 
                                        ?>">
                                            <?php echo $pedido['estado']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <a href="ver-pedido.php?id=<?php echo $pedido['id']; ?>" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i> Ver
                                            </a>
                                            <a href="cambiar-estado-pedido.php?id=<?php echo $pedido['id']; ?>" class="btn btn-sm btn-primary ml-1">
                                                <i class="fas fa-edit"></i> Cambiar Estado
                                            </a>
                                            <?php if ($pedido['estado_id'] == 4): // Si está cancelado ?>
                                            <a href="eliminar-pedido.php?id=<?php echo $pedido['id']; ?>" class="btn btn-sm btn-danger ml-1">
                                                <i class="fas fa-trash"></i> Eliminar
                                            </a>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="6" class="text-center">No se encontraron pedidos con los filtros seleccionados</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>