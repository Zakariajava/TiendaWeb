package tienda;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Clase UsuarioDAO (Actualizada)
 * ------------------------------------------------------------------
 * Esta clase gestiona todas las operaciones relacionadas con la tabla
 * "usuarios".
 * Forma parte de la capa de acceso a datos (DAO) dentro del patrón MVC.
 * Se encarga de obtener, registrar y modificar usuarios desde/hacia la base de
 * datos.
 *
 * Actualización: Separa la lógica de actualización de datos personales y
 * contraseña en métodos diferentes.
 * 
 * No contiene ningún acceso directo a base de datos.
 */
public class UsuarioDAO {

    /**
     * Busca un usuario en la base de datos a partir de su email.
     * Se utiliza para autenticación y verificación de existencia.
     *
     * @param email Email del usuario a buscar
     * @return Usuario si existe, null si no se encuentra
     */
    public Usuario buscarPorEmail(String email) {
        String sql = "SELECT * FROM usuarios WHERE email = ?";
        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setEmail(rs.getString("email"));
                u.setClave(rs.getString("clave"));
                u.setNombre(rs.getString("nombre"));
                u.setApellidos(rs.getString("apellidos"));
                u.setDomicilio(rs.getString("domicilio"));
                u.setPoblacion(rs.getString("poblacion"));
                u.setProvincia(rs.getString("provincia"));
                u.setCp(rs.getString("cp"));
                u.setTelefono(rs.getString("telefono"));
                u.setActivo(rs.getBoolean("activo"));
                u.setAdmin(rs.getBoolean("admin"));
                return u;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Verifica si un email ya está registrado en el sistema.
     *
     * @param email Email a comprobar
     * @return true si el email existe, false si no
     */
    public boolean existeEmail(String email) {
        return buscarPorEmail(email) != null;
    }

    /**
     * Registra un nuevo usuario en la base de datos.
     *
     * @param u Objeto Usuario con datos y contraseña ya hasheada
     */
    public void registrarUsuario(Usuario u) {
        String sql = "INSERT INTO usuarios (nombre, apellidos, domicilio, poblacion, provincia, cp, telefono, email, clave, activo, admin) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, u.getNombre());
            stmt.setString(2, u.getApellidos());
            stmt.setString(3, u.getDomicilio());
            stmt.setString(4, u.getPoblacion());
            stmt.setString(5, u.getProvincia());
            stmt.setString(6, u.getCp());
            stmt.setString(7, u.getTelefono());
            stmt.setString(8, u.getEmail());
            stmt.setString(9, u.getClave());
            stmt.setBoolean(10, true);
            stmt.setBoolean(11, false);

            stmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Devuelve el hash de la contraseña actual de un usuario por ID.
     *
     * @param userId ID del usuario
     * @return Contraseña en formato hash
     */
    public String obtenerHashActual(int userId) {
        String sql = "SELECT clave FROM usuarios WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getString("clave");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Actualiza todos los datos del usuario, incluida la contraseña si se
     * proporciona.
     *
     * @param u          Objeto Usuario con todos los datos a modificar
     * @param nuevaClave Hash de la nueva contraseña (o null si no se cambia)
     */
    public void actualizarDatosYClave(Usuario u, String nuevaClave) {
        String sql;
        boolean conClave = (nuevaClave != null);

        if (conClave) {
            sql = "UPDATE usuarios SET nombre=?, apellidos=?, domicilio=?, poblacion=?, provincia=?, cp=?, telefono=?, email=?, clave=? WHERE id=?";
        } else {
            sql = "UPDATE usuarios SET nombre=?, apellidos=?, domicilio=?, poblacion=?, provincia=?, cp=?, telefono=?, email=? WHERE id=?";
        }

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, u.getNombre());
            stmt.setString(2, u.getApellidos());
            stmt.setString(3, u.getDomicilio());
            stmt.setString(4, u.getPoblacion());
            stmt.setString(5, u.getProvincia());
            stmt.setString(6, u.getCp());
            stmt.setString(7, u.getTelefono());
            stmt.setString(8, u.getEmail());

            if (conClave) {
                stmt.setString(9, nuevaClave);
                stmt.setInt(10, u.getId());
            } else {
                stmt.setInt(9, u.getId());
            }

            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Actualiza solo la contraseña del usuario.
     * Método separado para mejorar la organización del código.
     *
     * @param u          Objeto Usuario con el ID y nueva clave hasheada
     * @param nuevaClave Hash de la nueva contraseña
     */
    public void actualizarSoloPassword(Usuario u, String nuevaClave) {
        String sql = "UPDATE usuarios SET clave=? WHERE id=?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, nuevaClave);
            stmt.setInt(2, u.getId());
            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Obtiene todos los datos de un usuario por su ID.
     * Útil para rellenar formularios con datos existentes.
     *
     * @param userId ID del usuario
     * @return Objeto Usuario completo o null si no existe
     */
    public Usuario obtenerPorId(int userId) {
        String sql = "SELECT * FROM usuarios WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNombre(rs.getString("nombre"));
                u.setApellidos(rs.getString("apellidos"));
                u.setDomicilio(rs.getString("domicilio"));
                u.setPoblacion(rs.getString("poblacion"));
                u.setProvincia(rs.getString("provincia"));
                u.setCp(rs.getString("cp"));
                u.setTelefono(rs.getString("telefono"));
                u.setEmail(rs.getString("email"));
                u.setClave(rs.getString("clave"));
                u.setActivo(rs.getBoolean("activo"));
                u.setAdmin(rs.getBoolean("admin"));
                return u;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Comprueba si un usuario está activo en el sistema.
     *
     * @param email Email del usuario
     * @return true si está activo, false si no o si no existe
     */
    public boolean esUsuarioActivo(String email) {
        String sql = "SELECT activo FROM usuarios WHERE email = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getBoolean("activo");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}