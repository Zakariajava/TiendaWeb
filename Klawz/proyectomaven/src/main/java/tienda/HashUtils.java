package tienda;

import java.security.MessageDigest;

/**
 * Clase HashUtils
 * ------------------------------------------------------------------
 * Clase utilitaria para operaciones de seguridad, como el hasheo de
 * contraseñas.
 * Centraliza el uso de algoritmos como SHA-256 para evitar duplicación de
 * código.
 * 
 * Esta clase puede utilizarse desde cualquier parte de la aplicación que
 * necesite
 * comparar, almacenar o validar contraseñas de forma segura.
 */
public class HashUtils {

    /**
     * Genera un hash SHA-256 de la cadena proporcionada.
     * 
     * @param input Cadena de texto que se desea hashear (normalmente la contraseña)
     * @return Hash en formato hexadecimal
     * @throws Exception Si ocurre algún error al generar el hash
     */
    public static String hash(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] bytes = md.digest(input.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
