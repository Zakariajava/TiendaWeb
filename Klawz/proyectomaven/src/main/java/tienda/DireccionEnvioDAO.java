package tienda;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Clase DireccionEnvioDAO
 * --------------------------------------------------------------
 * Esta clase forma parte de la capa DAO (Data Access Object) y se encarga
 * de todas las operaciones específicas relacionadas con las direcciones
 * de envío asociadas a los pedidos.
 *
 * Se asegura de seguir el patrón MVC separando la lógica de persistencia
 * de la lógica del negocio o de presentación.
 */
public class DireccionEnvioDAO {

    /**
     * Inserta una nueva dirección de envío asociada a un pedido.
     *
     * @param direccion Objeto DireccionEnvio con los datos a guardar
     * @throws SQLException si ocurre un error durante la operación
     */
    public void insertarDireccion(DireccionEnvio direccion) throws SQLException {
        String sql = "INSERT INTO direcciones_envio (pedido_id, domicilio, poblacion, provincia, cp, telefono) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, direccion.getPedidoId());
            stmt.setString(2, direccion.getDomicilio());
            stmt.setString(3, direccion.getPoblacion());
            stmt.setString(4, direccion.getProvincia());
            stmt.setString(5, direccion.getCp());
            stmt.setString(6, direccion.getTelefono());

            stmt.executeUpdate();
        }
    }

    /**
     * Recupera la dirección de envío asociada a un pedido.
     * CORREGIDO: El método ahora retorna correctamente el objeto DireccionEnvio.
     *
     * @param pedidoId ID del pedido
     * @return Objeto DireccionEnvio con los datos encontrados, o null si no existe
     * @throws SQLException si ocurre un error durante la consulta
     */
    public DireccionEnvio obtenerPorPedidoId(int pedidoId) throws SQLException {
        String sql = "SELECT * FROM direcciones_envio WHERE pedido_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pedidoId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                // Se utiliza el constructor completo para construir el objeto directamente
                DireccionEnvio direccion = new DireccionEnvio(
                        rs.getInt("pedido_id"),
                        rs.getString("domicilio"),
                        rs.getString("poblacion"),
                        rs.getString("provincia"),
                        rs.getString("cp"),
                        rs.getString("telefono"));
                direccion.setId(rs.getInt("id"));
                return direccion; // Retornar el objeto creado (CORREGIDO)
            }
        }
        return null; // Solo retornar null si no se encontró ninguna dirección
    }

    /**
     * Actualiza una dirección de envío existente.
     * 
     * @param direccion Objeto DireccionEnvio con los datos actualizados
     * @return true si se actualizó correctamente, false en caso contrario
     */
    public boolean actualizarDireccion(DireccionEnvio direccion) {
        String sql = "UPDATE direcciones_envio SET domicilio = ?, poblacion = ?, " +
                "provincia = ?, cp = ?, telefono = ? WHERE pedido_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, direccion.getDomicilio());
            stmt.setString(2, direccion.getPoblacion());
            stmt.setString(3, direccion.getProvincia());
            stmt.setString(4, direccion.getCp());
            stmt.setString(5, direccion.getTelefono());
            stmt.setInt(6, direccion.getPedidoId());

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}