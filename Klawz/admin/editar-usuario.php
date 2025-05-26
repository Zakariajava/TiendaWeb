<?php
/**
 * Archivo: editar-usuario.php
 * -------------------------
 * Página para editar los datos de un usuario.
 * Permite modificar nombre, apellidos, email, teléfono y tipo de usuario.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

require_once(__DIR__ . '/lib/verificar_sesion.php');
require_once(__DIR__ . '/lib/BaseDatos.php');

// Comprobar que se ha recibido un ID
if (!isset($_GET['id'])) {
    header('Location: usuarios.php');
    exit();
}

$id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
if (!$id) {
    header('Location: usuarios.php');
    exit();
}

$mensaje = '';
$error = '';

// Procesar formulario cuando se envía
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger datos del formulario
    $nombre = filter_input(INPUT_POST, 'nombre', FILTER_UNSAFE_RAW);
    $nombre = trim(htmlspecialchars($nombre));
    
    $apellidos = filter_input(INPUT_POST, 'apellidos', FILTER_UNSAFE_RAW);
    $apellidos = trim(htmlspecialchars($apellidos));
    
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    
    $telefono = filter_input(INPUT_POST, 'telefono', FILTER_UNSAFE_RAW);
    $telefono = trim(htmlspecialchars($telefono));
    
    $es_admin = filter_input(INPUT_POST, 'es_admin', FILTER_VALIDATE_INT);
    
    // Validar datos
    if (!$nombre || !$apellidos || !$email) {
        $error = "Por favor, complete todos los campos obligatorios";
    } else {
        // Actualizar usuario utilizando consulta preparada
        $sql = "UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ?, admin = ? WHERE id = ?";
        $resultado = BaseDatos::ejecutarOperacion($sql, "sssiii", [$nombre, $apellidos, $email, $telefono, $es_admin, $id]);
        
        if ($resultado !== false) {
            $mensaje = "Usuario actualizado correctamente";
        } else {
            $error = "Error al actualizar el usuario";
        }
    }
}

// Obtener datos del usuario para el formulario
$sql = "SELECT nombre, apellidos, email, telefono, admin, activo FROM usuarios WHERE id = ?";
$columnas = ['nombre', 'apellidos', 'email', 'telefono', 'admin', 'activo'];
$usuarios = BaseDatos::obtenerFilas($sql, "i", [$id], $columnas);

if (count($usuarios) === 0) {
    header('Location: usuarios.php');
    exit();
}

$usuario = $usuarios[0];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Usuario - Administración Klawz</title>
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
                            <a class="nav-link active text-white" href="usuarios.php">
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
                    <h1 class="h2">Editar Usuario</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <a href="usuarios.php" class="btn btn-sm btn-outline-secondary">
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
                        <h3 class="card-title">Datos de Usuario</h3>
                    </div>
                    <div class="card-body">
                        <form method="post" action="editar-usuario.php?id=<?php echo $id; ?>">
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="nombre">Nombre *</label>
                                    <input type="text" class="form-control" id="nombre" name="nombre" 
                                           value="<?php echo htmlspecialchars($usuario['nombre']); ?>" required>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="apellidos">Apellidos *</label>
                                    <input type="text" class="form-control" id="apellidos" name="apellidos" 
                                           value="<?php echo htmlspecialchars($usuario['apellidos']); ?>" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="email">Email *</label>
                                    <input type="email" class="form-control" id="email" name="email" 
                                           value="<?php echo htmlspecialchars($usuario['email']); ?>" required>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="telefono">Teléfono</label>
                                    <input type="text" class="form-control" id="telefono" name="telefono" 
                                           value="<?php echo htmlspecialchars($usuario['telefono']); ?>">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="es_admin">Tipo de Usuario</label>
                                <select class="form-control" id="es_admin" name="es_admin">
                                    <option value="0" <?php echo $usuario['admin'] ? '' : 'selected'; ?>>Cliente</option>
                                    <option value="1" <?php echo $usuario['admin'] ? 'selected' : ''; ?>>Administrador</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                                <a href="usuarios.php" class="btn btn-secondary">Cancelar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>