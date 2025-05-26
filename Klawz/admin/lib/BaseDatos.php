<?php
/**
 * Archivo: BaseDatos.php
 * ---------------------
 * Clase que proporciona métodos para la conexión y operaciones
 * con la base de datos. Implementa medidas contra inyección SQL
 * 
 * @author Zakaria abouhammadi
 * @version 1.1
 */

require_once(__DIR__ . '/config.php');

class BaseDatos {
    /**
     * Almacena la instancia de conexión a la base de datos
     * @var mysqli
     */
    private static $conexion;
    
    /**
     * Establece y devuelve una conexión a la base de datos.
     * Si ya existe una conexión, la devuelve sin crear una nueva.
     * 
     * @return mysqli Objeto de conexión a la base de datos
     */
    public static function conectar() {
        if (!isset(self::$conexion)) {
            self::$conexion = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
            
            if (mysqli_connect_error()) {
                die("Error de conexión a la base de datos: " . mysqli_connect_error());
            }
            
            mysqli_set_charset(self::$conexion, "utf8");
        }
        
        return self::$conexion;
    }
    
    /**
     * Cierra la conexión con la base de datos si existe.
     * 
     * @return void
     */
    public static function desconectar() {
        if (isset(self::$conexion)) {
            mysqli_close(self::$conexion);
            self::$conexion = null;
        }
    }
    
    /**
    * Ejecuta una consulta SQL preparada usando PDO
    * 
    * @param string $sql      Consulta SQL con marcadores de posición
    * @param string $tipos    Cadena que especifica los tipos de los parámetros
    * @param array $params    Array con los valores de los parámetros
    * @param array $resultados Array de variables donde se almacenarán los resultados
    * @return bool True si la consulta se ejecutó correctamente, false en caso contrario
    */
    public static function ejecutarConsultaConValor($sql, $tipos, $params, &$resultados) {
        $conexion = self::conectar();
        
        if ($mi_consulta = mysqli_prepare($conexion, $sql)) {
            // Vincular parámetros si existen
            if (!empty($tipos) && !empty($params)) {
                mysqli_stmt_bind_param($mi_consulta, $tipos, ...$params);
            }
            
            // Ejecutar consulta
            mysqli_stmt_execute($mi_consulta);
            
            // Vincular resultados
            if (count($resultados) > 0) {
                $args = array($mi_consulta);
                foreach ($resultados as &$resultado) {
                    $args[] = &$resultado;
                }
                call_user_func_array('mysqli_stmt_bind_result', $args);
                
                // Obtener resultados
                $exito = mysqli_stmt_fetch($mi_consulta);
            } else {
                $exito = true;
            }
            
            mysqli_stmt_close($mi_consulta);
            return $exito;
        }
        
        return false;
    }
    
    /**
    * Ejecuta una consulta SQL preparada que devuelve múltiples filas,
    * usando PDO para la prevención de inyección SQL.
    * 
    * @param string $sql       Consulta SQL con marcadores de posición
    * @param string $tipos     Cadena que especifica los tipos de los parámetros
    * @param array $params     Array con los valores de los parámetros
    * @param array $columnas   Array con los nombres de las columnas a obtener
    * @return array Resultado de la consulta con múltiples filas
    */
    public static function obtenerFilas($sql, $tipos, $params, $columnas) {
        $conexion = self::conectar();
        $resultados = array();
        
        if ($mi_consulta = mysqli_prepare($conexion, $sql)) {
            // Vincular parámetros si existen
            if (!empty($tipos) && !empty($params)) {
                mysqli_stmt_bind_param($mi_consulta, $tipos, ...$params);
            }
            
            // Ejecutar consulta
            mysqli_stmt_execute($mi_consulta);
            
            // Crear referencias para los resultados
            $fila = array();
            $args = array($mi_consulta);
            
            foreach ($columnas as $columna) {
                $fila[$columna] = null;
                $args[] = &$fila[$columna];
            }
            
            // Vincular resultados
            call_user_func_array('mysqli_stmt_bind_result', $args);
            
            // Obtener resultados
            while (mysqli_stmt_fetch($mi_consulta)) {
                $resultadoFila = array();
                foreach ($columnas as $columna) {
                    $resultadoFila[$columna] = $fila[$columna];
                }
                $resultados[] = $resultadoFila;
            }
            
            mysqli_stmt_close($mi_consulta);
        }
        
        return $resultados;
    }
    
    /**
    * Ejecuta una operación SQL (INSERT, UPDATE, DELETE)
    * 
    * @param string $sql    Consulta SQL con marcadores de posición
    * @param string $tipos  Cadena que especifica los tipos de los parámetros
    * @param array $params  Array con los valores de los parámetros
    * @return bool|int True/ID si éxito, false si falla
    */
    public static function ejecutarOperacion($sql, $tipos, $params) {
        $conexion = self::conectar();
        
        if ($mi_consulta = mysqli_prepare($conexion, $sql)) {
            // Vincular parámetros
            if (!empty($tipos) && !empty($params)) {
                mysqli_stmt_bind_param($mi_consulta, $tipos, ...$params);
            }
            
            // Ejecutar operación
            $resultado = mysqli_stmt_execute($mi_consulta);
            
            // Obtener ID en caso de INSERT
            $id = 0;
            if ($resultado && strpos(strtoupper($sql), 'INSERT') === 0) {
                $id = mysqli_insert_id($conexion);
            }
            
            mysqli_stmt_close($mi_consulta);
            return $resultado ? ($id > 0 ? $id : true) : false;
        }
        
        return false;
    }
    
    /**
     * Verifica si un registro existe en una tabla según una condición
     * 
     * @param string $tabla   Nombre de la tabla
     * @param string $campo   Campo a comprobar
     * @param mixed $valor    Valor a buscar
     * @param string $tipo    Tipo de dato ('i' para entero, 's' para string, etc.)
     * @return bool           True si existe, false en caso contrario
     */
    public static function existeRegistro($tabla, $campo, $valor, $tipo = 'i') {
        $sql = "SELECT COUNT(*) AS total FROM $tabla WHERE $campo = ?";
        $total = 0;
        $resultados = array(&$total);
        self::ejecutarConsultaConValor($sql, $tipo, [$valor], $resultados);
        return $total > 0;
    }
    
    /**
     * Comprueba si un usuario tiene pedidos asociados
     * 
     * @param int $usuario_id ID del usuario
     * @return bool True si tiene pedidos, false en caso contrario
     */
    public static function usuarioTienePedidos($usuario_id) {
        return self::existeRegistro('pedidos', 'usuario_id', $usuario_id, 'i');
    }
    
    /**
     * Comprueba si un producto está en algún pedido
     * 
     * @param int $producto_id ID del producto
     * @return bool True si está en algún pedido, false en caso contrario
     */
    public static function productoEnPedidos($producto_id) {
        return self::existeRegistro('detalles_pedido', 'producto_id', $producto_id, 'i');
    }
}
?>