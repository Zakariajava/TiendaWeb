package tienda;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Clase AccesoBD
 * --------------------------
 * Esta clase proporciona el método necesario para establecer una conexión con
 * la base de datos MariaDB.
 * Se utiliza en toda la aplicación para centralizar la configuración de acceso
 * a la base de datos,
 * evitando la repetición del código de conexión en diferentes clases.
 *
 * La conexión se realiza con el driver JDBC de MariaDB, y los parámetros de
 * conexión están configurados
 * para acceder a la base de datos local "klawz" con usuario "root" y contraseña
 * "root".
 * 
 *
 */
public class AccesoBD {

    /**
     * Obtiene una conexión a la base de datos MariaDB.
     *
     * @return una instancia de java.sql.Connection si la conexión es exitosa, o
     *         null si ocurre un error.
     */
    public static Connection getConnection() {
        try {
            // Cargar el driver JDBC de MariaDB en memoria
            Class.forName("org.mariadb.jdbc.Driver");

            // Establecer la conexión usando la URL de la base de datos, usuario y
            // contraseña
            return DriverManager.getConnection(
                    "jdbc:mariadb://localhost:3306/klawz", // URL de conexión (bd local "klawz")
                    "root", // Usuario de la base de datos
                    "root" // Contraseña de la base de datos
            );
        } catch (Exception e) {
            // Imprimir la traza del error para facilitar el diagnóstico
            e.printStackTrace();
            return null; // En caso de error, se retorna null
        }
    }
}
