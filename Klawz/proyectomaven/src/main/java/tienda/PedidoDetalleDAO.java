package tienda;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase PedidoDetalleDAO
 * --------------------------------------------------------------
 * Esta clase forma parte de la capa DAO (Data Access Object) y se encarga
 * de todas las operaciones específicas relacionadas con los detalles de
 * los pedidos (líneas individuales de productos comprados por pedido).
 *
 * Su principal función es mantener la responsabilidad separada del
 * PedidoDAO, mejorando así la mantenibilidad y el cumplimiento estricto
 * del patrón de diseño MVC (Modelo-Vista-Controlador).
 */
public class PedidoDetalleDAO {

    /**
     * Inserta una línea de detalle en la tabla `detalles_pedido`.
     *
     * @param conn           conexión activa (usada en transacción de pedido)
     * @param pedidoId       ID del pedido al que pertenece el detalle
     * @param productoId     ID del producto comprado
     * @param cantidad       número de unidades compradas
     * @param precioUnitario precio del producto en el momento de la compra
     * @throws SQLException si ocurre un error durante la inserción
     */
    public void insertarDetalle(Connection conn, int pedidoId, int productoId, int cantidad, double precioUnitario)
            throws SQLException {
        String sql = "INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, estado) VALUES (?, ?, ?, ?, 'activo')";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, pedidoId);
            stmt.setInt(2, productoId);
            stmt.setInt(3, cantidad);
            stmt.setDouble(4, precioUnitario);
            stmt.executeUpdate();
        }
    }

    /**
     * Devuelve la lista de detalles de un pedido específico.
     * Cada detalle contiene el nombre del producto, cantidad y precio unitario.
     * Versión mejorada: ahora incluye el ID del detalle.
     *
     * @param conn     conexión activa (usada por PedidoDAO)
     * @param pedidoId ID del pedido a consultar
     * @return lista de objetos DetallePedido
     * @throws SQLException si ocurre un error al consultar la base de datos
     */
    public List<DetallePedido> obtenerDetallesPorPedido(Connection conn, int pedidoId) throws SQLException {
        List<DetallePedido> detalles = new ArrayList<>();
        String sql = "SELECT dp.id, pr.nombre, dp.cantidad, dp.precio_unitario " +
                "FROM detalles_pedido dp JOIN productos pr ON dp.producto_id = pr.id " +
                "WHERE dp.pedido_id = ? AND dp.estado = 'activo'";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, pedidoId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                detalles.add(new DetallePedido(
                        rs.getInt("id"),
                        rs.getString("nombre"),
                        rs.getInt("cantidad"),
                        rs.getDouble("precio_unitario")));
            }
        }
        return detalles;
    }

    /**
     * Devuelve la lista de detalles extendidos de un pedido específico.
     * La versión extendida incluye IDs y estado para permitir la cancelación
     * parcial.
     *
     * @param conn     conexión activa
     * @param pedidoId ID del pedido a consultar
     * @return lista de objetos DetallePedidoExtendido
     * @throws SQLException si ocurre un error al consultar la base de datos
     */
    public List<DetallePedidoExtendido> obtenerDetallesExtendidosPorPedido(Connection conn, int pedidoId)
            throws SQLException {
        List<DetallePedidoExtendido> detalles = new ArrayList<>();
        String sql = "SELECT dp.id, dp.pedido_id, dp.producto_id, pr.nombre, dp.cantidad, " +
                "dp.precio_unitario, dp.estado " +
                "FROM detalles_pedido dp JOIN productos pr ON dp.producto_id = pr.id " +
                "WHERE dp.pedido_id = ?";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, pedidoId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                detalles.add(new DetallePedidoExtendido(
                        rs.getInt("id"),
                        rs.getInt("pedido_id"),
                        rs.getInt("producto_id"),
                        rs.getString("nombre"),
                        rs.getInt("cantidad"),
                        rs.getDouble("precio_unitario"),
                        rs.getString("estado")));
            }
        }
        return detalles;
    }

    /**
     * Cancela un detalle específico de un pedido y devuelve el stock.
     * Solo funciona con pedidos en estado pendiente.
     *
     * @param detalleId ID del detalle a cancelar
     * @param pedidoId  ID del pedido al que pertenece
     * @param usuarioId ID del usuario que realiza la cancelación
     * @return true si se cancela correctamente, false si no
     */
    public boolean cancelarDetallePedido(int detalleId, int pedidoId, int usuarioId) {
        Connection conn = null;
        PreparedStatement stmtCheck = null;
        PreparedStatement stmtDetalle = null;
        PreparedStatement stmtCancelar = null;
        PreparedStatement stmtStock = null;
        PreparedStatement stmtVerificar = null;
        PreparedStatement stmtCancelarPedido = null;
        ResultSet rsCheck = null;
        ResultSet rsDetalle = null;
        ResultSet rsVerificar = null;

        try {
            System.out.println(
                    "Iniciando cancelación de detalle de pedido - detalleId: " + detalleId + ", pedidoId: " + pedidoId);
            conn = AccesoBD.getConnection();

            if (conn == null) {
                System.out.println("Error: No se pudo obtener conexión a la base de datos");
                return false;
            }

            conn.setAutoCommit(false);
            System.out.println("Autocommit desactivado");

            // 1. Verificar que el pedido esté pendiente y pertenezca al usuario
            String checkPedidoSql = "SELECT p.estado_id FROM pedidos p " +
                    "WHERE p.id = ? AND p.usuario_id = ?";
            stmtCheck = conn.prepareStatement(checkPedidoSql);
            stmtCheck.setInt(1, pedidoId);
            stmtCheck.setInt(2, usuarioId);

            System.out.println("Verificando pedido - SQL: " + checkPedidoSql);
            System.out.println("Parámetros: pedidoId=" + pedidoId + ", usuarioId=" + usuarioId);

            rsCheck = stmtCheck.executeQuery();

            if (!rsCheck.next()) {
                System.out.println("Error: Pedido no encontrado o no pertenece al usuario");
                conn.rollback();
                return false;
            }

            int estadoId = rsCheck.getInt("estado_id");
            System.out.println("Estado del pedido: " + estadoId);

            if (estadoId != 1) {
                System.out.println("Error: El pedido no está en estado pendiente (estado_id = " + estadoId + ")");
                conn.rollback();
                return false;
            }

            // 2. Obtener información del detalle (producto y cantidad)
            String getDetalleSql = "SELECT producto_id, cantidad, estado FROM detalles_pedido " +
                    "WHERE id = ? AND pedido_id = ?";
            stmtDetalle = conn.prepareStatement(getDetalleSql);
            stmtDetalle.setInt(1, detalleId);
            stmtDetalle.setInt(2, pedidoId);

            System.out.println("Consultando detalle - SQL: " + getDetalleSql);
            System.out.println("Parámetros: detalleId=" + detalleId + ", pedidoId=" + pedidoId);

            rsDetalle = stmtDetalle.executeQuery();

            if (!rsDetalle.next()) {
                System.out.println("Error: Detalle no encontrado");
                conn.rollback();
                return false;
            }

            int productoId = rsDetalle.getInt("producto_id");
            int cantidad = rsDetalle.getInt("cantidad");
            String estadoActual = rsDetalle.getString("estado");

            System.out.println("Detalle encontrado - productoId: " + productoId + ", cantidad: " + cantidad
                    + ", estado: " + estadoActual);

            if (!"activo".equals(estadoActual)) {
                System.out.println("Error: El detalle ya está cancelado o en otro estado");
                conn.rollback();
                return false;
            }

            // 3. Marcar el detalle como cancelado
            String cancelarSql = "UPDATE detalles_pedido SET estado = 'cancelado' " +
                    "WHERE id = ? AND pedido_id = ?";
            stmtCancelar = conn.prepareStatement(cancelarSql);
            stmtCancelar.setInt(1, detalleId);
            stmtCancelar.setInt(2, pedidoId);

            System.out.println("Cancelando detalle - SQL: " + cancelarSql);
            System.out.println("Parámetros: detalleId=" + detalleId + ", pedidoId=" + pedidoId);

            int rowsAffected = stmtCancelar.executeUpdate();

            if (rowsAffected == 0) {
                System.out.println("Error: No se pudo actualizar el estado del detalle");
                conn.rollback();
                return false;
            }

            System.out.println("Detalle marcado como cancelado correctamente");

            // 4. Restaurar stock del producto
            String updateStockSql = "UPDATE productos SET stock = stock + ? WHERE id = ?";
            stmtStock = conn.prepareStatement(updateStockSql);
            stmtStock.setInt(1, cantidad);
            stmtStock.setInt(2, productoId);

            System.out.println("Restaurando stock - SQL: " + updateStockSql);
            System.out.println("Parámetros: cantidad=" + cantidad + ", productoId=" + productoId);

            stmtStock.executeUpdate();
            System.out.println("Stock restaurado correctamente");

            // 5. Verificar si todos los detalles del pedido están cancelados
            String verificarSql = "SELECT COUNT(*) as activos FROM detalles_pedido " +
                    "WHERE pedido_id = ? AND estado = 'activo'";
            stmtVerificar = conn.prepareStatement(verificarSql);
            stmtVerificar.setInt(1, pedidoId);

            System.out.println("Verificando si quedan detalles activos - SQL: " + verificarSql);
            System.out.println("Parámetros: pedidoId=" + pedidoId);

            rsVerificar = stmtVerificar.executeQuery();

            if (rsVerificar.next() && rsVerificar.getInt("activos") == 0) {
                // Si todos los detalles están cancelados, cancelar el pedido
                String cancelarPedidoSql = "UPDATE pedidos SET estado_id = 4 WHERE id = ?";
                stmtCancelarPedido = conn.prepareStatement(cancelarPedidoSql);
                stmtCancelarPedido.setInt(1, pedidoId);

                System.out
                        .println("Todos los detalles están cancelados. Cancelando pedido - SQL: " + cancelarPedidoSql);
                System.out.println("Parámetros: pedidoId=" + pedidoId);

                stmtCancelarPedido.executeUpdate();
                System.out.println("Pedido cancelado automáticamente");
            }

            // Confirmar transacción
            conn.commit();
            System.out.println("Transacción completada con éxito");
            return true;

        } catch (Exception e) {
            // En caso de error, hacer rollback
            try {
                if (conn != null) {
                    System.out.println("Error en la operación, haciendo rollback: " + e.getMessage());
                    conn.rollback();
                }
            } catch (SQLException ex) {
                System.out.println("Error adicional durante rollback: " + ex.getMessage());
                ex.printStackTrace();
            }
            System.out.println("Excepción completa:");
            e.printStackTrace();
            return false;
        } finally {
            // Cerrar todos los recursos
            try {
                if (rsVerificar != null)
                    rsVerificar.close();
                if (rsDetalle != null)
                    rsDetalle.close();
                if (rsCheck != null)
                    rsCheck.close();
                if (stmtCancelarPedido != null)
                    stmtCancelarPedido.close();
                if (stmtVerificar != null)
                    stmtVerificar.close();
                if (stmtStock != null)
                    stmtStock.close();
                if (stmtCancelar != null)
                    stmtCancelar.close();
                if (stmtDetalle != null)
                    stmtDetalle.close();
                if (stmtCheck != null)
                    stmtCheck.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                    System.out.println("Conexión cerrada correctamente");
                }
            } catch (SQLException e) {
                System.out.println("Error al cerrar recursos: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}