package tienda;

import java.sql.*;

/**
 * Clase DireccionPredeterminadaDAO
 * ------------------------------------------------------------------
 * Gestiona las operaciones de acceso a datos relacionadas con las
 * direcciones predeterminadas de los usuarios.
 */
public class DireccionPredeterminadaDAO {

    /**
     * Obtiene la dirección predeterminada de un usuario
     * 
     * @param usuarioId ID del usuario
     * @return DireccionPredeterminada o null si no existe
     */
    public DireccionPredeterminada obtenerPorUsuarioId(int usuarioId) {
        String sql = "SELECT * FROM direcciones_predeterminadas WHERE usuario_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                DireccionPredeterminada direccion = new DireccionPredeterminada();
                direccion.setId(rs.getInt("id"));
                direccion.setUsuarioId(rs.getInt("usuario_id"));
                direccion.setDomicilio(rs.getString("domicilio"));
                direccion.setPoblacion(rs.getString("poblacion"));
                direccion.setProvincia(rs.getString("provincia"));
                direccion.setCp(rs.getString("cp"));
                direccion.setTelefono(rs.getString("telefono"));
                return direccion;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Guarda o actualiza la dirección predeterminada de un usuario
     * 
     * @param direccion La dirección predeterminada a guardar
     * @return true si se realizó correctamente, false en caso contrario
     */
    public boolean guardarOActualizar(DireccionPredeterminada direccion) {
        // Primero verificamos si ya existe una dirección para este usuario
        DireccionPredeterminada existente = obtenerPorUsuarioId(direccion.getUsuarioId());

        try (Connection conn = AccesoBD.getConnection()) {
            PreparedStatement stmt;

            if (existente == null) {
                // Si no existe, insertamos una nueva
                String sql = "INSERT INTO direcciones_predeterminadas (usuario_id, domicilio, poblacion, provincia, cp, telefono) "
                        +
                        "VALUES (?, ?, ?, ?, ?, ?)";
                stmt = conn.prepareStatement(sql);
            } else {
                // Si existe, actualizamos la existente
                String sql = "UPDATE direcciones_predeterminadas SET domicilio = ?, poblacion = ?, " +
                        "provincia = ?, cp = ?, telefono = ? WHERE usuario_id = ?";
                stmt = conn.prepareStatement(sql);

                // En el UPDATE, el usuario_id va al final
                stmt.setString(1, direccion.getDomicilio());
                stmt.setString(2, direccion.getPoblacion());
                stmt.setString(3, direccion.getProvincia());
                stmt.setString(4, direccion.getCp());
                stmt.setString(5, direccion.getTelefono());
                stmt.setInt(6, direccion.getUsuarioId());

                return stmt.executeUpdate() > 0;
            }

            // En el INSERT, el usuario_id va primero
            stmt.setInt(1, direccion.getUsuarioId());
            stmt.setString(2, direccion.getDomicilio());
            stmt.setString(3, direccion.getPoblacion());
            stmt.setString(4, direccion.getProvincia());
            stmt.setString(5, direccion.getCp());
            stmt.setString(6, direccion.getTelefono());

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Elimina la dirección predeterminada de un usuario
     * 
     * @param usuarioId ID del usuario
     * @return true si se eliminó correctamente, false en caso contrario
     */
    public boolean eliminar(int usuarioId) {
        String sql = "DELETE FROM direcciones_predeterminadas WHERE usuario_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}