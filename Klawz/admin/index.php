<?php
/**
 * Archivo: index.php
 * -----------------
 * Página principal del módulo de administración que muestra
 * el formulario de inicio de sesión. Valida las credenciales
 * del usuario contra la base de datos y crea la sesión si son correctas.
 * 
 * Solo permite el acceso a usuarios que sean administradores y
 * estén activos en el sistema.
 * 
 * @author Zakaria abouhammadi
 * @version 1.0
 */

session_start();

// Si ya hay sesión redirigir a dashboard
if (isset($_SESSION['admin_id'])) {
    header('Location: dashboard.php');
    exit();
}

// Mensaje de error
$error = "";
// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once(__DIR__ . '/lib/BaseDatos.php');
    
    // Obtener datos del formulario
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $clave = filter_input(INPUT_POST, 'clave', FILTER_UNSAFE_RAW);
    $clave = trim(htmlspecialchars($clave));
    
    if ($email && $clave) {
    $sql = "SELECT id, nombre, apellidos FROM usuarios WHERE email = ? AND clave = ? AND admin = 1 AND activo = 1";
    
    // Variables para almacenar resultados
    $id = null;
    $nombre = null;
    $apellidos = null;
    $resultados = array(&$id, &$nombre, &$apellidos);
    
    // Se obtienen los resultados directamente en las variables
    $exito = BaseDatos::ejecutarConsultaConValor($sql, "ss", [$email, hash('sha256', $clave)], $resultados);
    
    if ($exito && $id !== null) {
        // Crear variables de sesión
        $_SESSION['admin_id'] = $id;
        $_SESSION['admin_nombre'] = $nombre;
        $_SESSION['admin_apellidos'] = $apellidos;
        
        // Redirigir al dashboard
        header('Location: dashboard.php');
        exit();
    } else {
        $error = "Email o contraseña incorrectos";
    }
    } else {
        $error = "Por favor, complete todos los campos correctamente";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administración Klawz - Login</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body class="bg-light">
    <div class="container">
        <div class="row justify-content-center mt-5">
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white text-center">
                        <h3>Panel de Administración Klawz</h3>
                    </div>
                    <div class="card-body">
                        <?php if ($error): ?>
                            <div class="alert alert-danger" role="alert">
                                <?php echo $error; ?>
                            </div>
                        <?php endif; ?>
                        
                        <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="clave">Contraseña</label>
                                <input type="password" class="form-control" id="clave" name="clave" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
                        </form>
                    </div>
                </div>
                <div class="text-center mt-3">
                    <a href="../proyectomaven/src/main/webapp/html/index.jsp" class="text-decoration-none">
                        <i class="fas fa-arrow-left"></i> Volver a la tienda
                    </a>
                </div>
            </div>
        </div>
    </div>

    <?php require_once(__DIR__ . '/lib/footer.php'); ?>