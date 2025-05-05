package tienda;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase MensajeDAO
 * --------------------------------------------------------------
 * Esta clase gestiona el acceso a datos para la entidad Mensaje.
 * Proporciona métodos para guardar, recuperar y gestionar mensajes
 * enviados por los clientes a través del formulario de contacto.
 */
public class MensajeDAO {

    /**
     * Guarda un nuevo mensaje en la base de datos.
     * 
     * @param mensaje Objeto Mensaje con los datos a guardar
     * @return ID del mensaje guardado, o -1 si ocurre un error
     */
    public int guardarMensaje(Mensaje mensaje) {
        String sql = "INSERT INTO mensajes (nombre, email, contenido, fecha_recepcion, leido) " +
                "VALUES (?, ?, ?, NOW(), ?)";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, mensaje.getNombre());
            stmt.setString(2, mensaje.getEmail());
            stmt.setString(3, mensaje.getContenido());
            stmt.setBoolean(4, mensaje.isLeido());

            int filasAfectadas = stmt.executeUpdate();

            if (filasAfectadas == 0) {
                return -1; // No se pudo guardar el mensaje
            }

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1); // Devolver el ID generado
                } else {
                    return -1;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return -1;
        }
    }

    /**
     * Recupera un mensaje específico por su ID.
     * 
     * @param id ID del mensaje a recuperar
     * @return Objeto Mensaje, o null si no se encuentra
     */
    public Mensaje obtenerMensajePorId(int id) {
        String sql = "SELECT * FROM mensajes WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return extraerMensajeDeResultSet(rs);
                } else {
                    return null;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Recupera todos los mensajes de la base de datos.
     * 
     * @return Lista de objetos Mensaje, o lista vacía si no hay mensajes
     */
    public List<Mensaje> obtenerTodosMensajes() {
        String sql = "SELECT * FROM mensajes ORDER BY fecha_recepcion DESC";
        List<Mensaje> mensajes = new ArrayList<>();

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                mensajes.add(extraerMensajeDeResultSet(rs));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return mensajes;
    }

    /**
     * Marca un mensaje como leído.
     * 
     * @param id ID del mensaje a marcar
     * @return true si se marca correctamente, false en caso contrario
     */
    public boolean marcarComoLeido(int id) {
        String sql = "UPDATE mensajes SET leido = TRUE WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Elimina un mensaje de la base de datos.
     * 
     * @param id ID del mensaje a eliminar
     * @return true si se elimina correctamente, false en caso contrario
     */
    public boolean eliminarMensaje(int id) {
        String sql = "DELETE FROM mensajes WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Método auxiliar para extraer un objeto Mensaje de un ResultSet.
     * 
     * @param rs ResultSet con los datos del mensaje
     * @return Objeto Mensaje con los datos extraídos
     * @throws SQLException si ocurre un error al acceder a los datos
     */
    private Mensaje extraerMensajeDeResultSet(ResultSet rs) throws SQLException {
        return new Mensaje(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("email"),
                rs.getString("contenido"),
                rs.getTimestamp("fecha_recepcion"),
                rs.getBoolean("leido"));
    }
}