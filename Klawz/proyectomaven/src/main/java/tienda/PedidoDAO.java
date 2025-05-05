package tienda;

import java.sql.*;
import java.util.*;

/**
 * Clase PedidoDAO
 * ------------------------------------------------------------------------------
 * Esta clase forma parte de la capa DAO (Data Access Object) y gestiona
 * las operaciones principales sobre la entidad Pedido.
 * 
 * Responsabilidades:
 * - Crear pedidos nuevos (incluyendo stock y detalles)
 * - Obtener pedidos por usuario (con detalles)
 * - Cancelar pedidos si están pendientes
 * 
 * Los detalles individuales se gestionan a través de la clase PedidoDetalleDAO.
 */
public class PedidoDAO {

    // DAO auxiliar para los detalles del pedido (inyección directa)
    private PedidoDetalleDAO detalleDAO = new PedidoDetalleDAO();

    /**
     * Crea un nuevo pedido en la base de datos con todos sus detalles,
     * y actualiza el stock correspondiente de los productos.
     *
     * Este método debe usarse durante el checkout (desde CheckoutServlet).
     *
     * @param usuarioId ID del usuario que realiza el pedido
     * @param carrito   Lista de productos y cantidades (CartItem)
     * @return ID del pedido creado, o -1 si hubo error
     */
    public int crearPedidoConDetalles(int usuarioId, List<CartItem> carrito) throws Exception {
        int pedidoId = -1;
        Connection conn = null;

        try {
            conn = AccesoBD.getConnection();
            conn.setAutoCommit(false); // Iniciar transacción

            // Paso 1: Insertar nuevo pedido en tabla pedidos
            String sqlPedido = "INSERT INTO pedidos (usuario_id, fecha, estado_id) VALUES (?, NOW(), 1)";
            try (PreparedStatement stmtPedido = conn.prepareStatement(sqlPedido,
                    PreparedStatement.RETURN_GENERATED_KEYS)) {
                stmtPedido.setInt(1, usuarioId);
                stmtPedido.executeUpdate();

                try (ResultSet rs = stmtPedido.getGeneratedKeys()) {
                    if (rs.next()) {
                        pedidoId = rs.getInt(1);
                    }
                }
            }

            if (pedidoId <= 0) {
                conn.rollback();
                return -1;
            }

            // Paso 2: Preparar actualización de stock
            String sqlStock = "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?";
            try (PreparedStatement stmtStock = conn.prepareStatement(sqlStock)) {
                // Paso 3: Procesar cada ítem del carrito
                for (CartItem item : carrito) {
                    int productoId = item.getProductId();
                    int cantidad = item.getQuantity();

                    double precio = obtenerPrecioProducto(conn, productoId);
                    if (precio < 0) {
                        conn.rollback(); // Producto no encontrado
                        return -1;
                    }

                    // Insertar línea del detalle del pedido
                    detalleDAO.insertarDetalle(conn, pedidoId, productoId, cantidad, precio);

                    // Actualizar stock del producto
                    stmtStock.setInt(1, cantidad);
                    stmtStock.setInt(2, productoId);
                    stmtStock.setInt(3, cantidad);
                    int actualizado = stmtStock.executeUpdate();
                    if (actualizado == 0) {
                        conn.rollback(); // Stock insuficiente
                        return -1;
                    }
                }
            }

            conn.commit(); // Confirmar transacción
            return pedidoId;

        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback(); // Deshacer cambios en caso de error
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
            throw e; // Propagar error
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true); // Restaurar autocommit
                    conn.close(); // Cerrar conexión
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Consulta el precio de un producto a partir de su ID.
     *
     * @param conn   conexión activa
     * @param prodId ID del producto
     * @return precio actual o -1 si no se encuentra
     */
    private double obtenerPrecioProducto(Connection conn, int prodId) throws SQLException {
        String sql = "SELECT precio FROM productos WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, prodId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("precio");
                }
            }
        }
        return -1;
    }

    /**
     * Devuelve todos los pedidos de un usuario con sus detalles incluidos.
     * Mejorado: Gestión de conexiones cerradas adecuadamente.
     *
     * @param usuarioId ID del usuario autenticado
     * @return lista de objetos Pedido completos
     */
    public List<Pedido> obtenerPedidosConDetallesPorUsuario(int usuarioId) {
        List<Pedido> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = AccesoBD.getConnection();
            String sql = "SELECT p.id, p.fecha, e.nombre AS estado " +
                    "FROM pedidos p JOIN estados e ON p.estado_id = e.id " +
                    "WHERE p.usuario_id = ? ORDER BY p.fecha DESC";

            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, usuarioId);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Pedido pedido = new Pedido();
                pedido.setId(rs.getInt("id"));
                pedido.setFecha(rs.getTimestamp("fecha"));
                pedido.setEstado(rs.getString("estado"));
                pedido.setDetalles(detalleDAO.obtenerDetallesPorPedido(conn, pedido.getId()));
                lista.add(pedido);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // Cerrar recursos en orden inverso (rs -> stmt -> conn)
            try {
                if (rs != null)
                    rs.close();
                if (stmt != null)
                    stmt.close();
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return lista;
    }

    /**
     * Devuelve todos los pedidos de un usuario con sus detalles extendidos
     * incluidos.
     * Esta versión incluye los IDs de los detalles para permitir la cancelación
     * individual.
     *
     * @param usuarioId ID del usuario autenticado
     * @return lista de objetos Pedido con detalles extendidos
     */
    public List<Pedido> obtenerPedidosConDetallesExtendidosPorUsuario(int usuarioId) {
        List<Pedido> lista = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = AccesoBD.getConnection();
            String sql = "SELECT p.id, p.fecha, e.nombre AS estado " +
                    "FROM pedidos p JOIN estados e ON p.estado_id = e.id " +
                    "WHERE p.usuario_id = ? ORDER BY p.fecha DESC";

            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, usuarioId);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Pedido pedido = new Pedido();
                pedido.setId(rs.getInt("id"));
                pedido.setFecha(rs.getTimestamp("fecha"));
                pedido.setEstado(rs.getString("estado"));

                // Obtener detalles extendidos (incluye IDs)
                List<DetallePedidoExtendido> detallesExtendidos = detalleDAO.obtenerDetallesExtendidosPorPedido(conn,
                        pedido.getId());

                // Convertir detalles extendidos a detalles normales (pero manteniendo el ID)
                List<DetallePedido> detalles = new ArrayList<>();
                for (DetallePedidoExtendido detalle : detallesExtendidos) {
                    // Crear un DetallePedido que incluya el ID (usando herencia)
                    detalles.add(detalle);
                }

                pedido.setDetalles(detalles);
                lista.add(pedido);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // Cerrar recursos en orden inverso (rs -> stmt -> conn)
            try {
                if (rs != null)
                    rs.close();
                if (stmt != null)
                    stmt.close();
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return lista;
    }

    /**
     * Cancela un pedido si aún se encuentra en estado "pendiente".
     *
     * @param pedidoId  ID del pedido
     * @param usuarioId ID del usuario autenticado
     * @return true si se cancela correctamente, false en caso contrario
     */
    public boolean cancelarPedidoSiPendiente(int pedidoId, int usuarioId) {
        Connection conn = null;
        PreparedStatement psCheck = null;
        PreparedStatement psUpdate = null;
        ResultSet rs = null;

        try {
            conn = AccesoBD.getConnection();
            conn.setAutoCommit(false); // Iniciar transacción

            // Primero verificar que el pedido esté pendiente y pertenezca al usuario
            String checkSql = "SELECT estado_id FROM pedidos WHERE id = ? AND usuario_id = ?";
            psCheck = conn.prepareStatement(checkSql);
            psCheck.setInt(1, pedidoId);
            psCheck.setInt(2, usuarioId);
            rs = psCheck.executeQuery();

            if (rs.next() && rs.getInt("estado_id") == 1) {
                // Obtener detalles del pedido para restaurar stock
                List<DetallePedidoExtendido> detalles = detalleDAO.obtenerDetallesExtendidosPorPedido(conn, pedidoId);

                // Actualizar stock por cada producto
                String updateStockSql = "UPDATE productos SET stock = stock + ? WHERE id = ?";
                try (PreparedStatement psStock = conn.prepareStatement(updateStockSql)) {
                    for (DetallePedidoExtendido detalle : detalles) {
                        if (detalle.isActivo()) { // Solo restaurar stock de productos no cancelados
                            psStock.setInt(1, detalle.getCantidad());
                            psStock.setInt(2, detalle.getProductoId());
                            psStock.executeUpdate();
                        }
                    }
                }

                // Actualizar estado del pedido
                String updateSql = "UPDATE pedidos SET estado_id = 4 WHERE id = ?";
                psUpdate = conn.prepareStatement(updateSql);
                psUpdate.setInt(1, pedidoId);
                boolean resultado = psUpdate.executeUpdate() == 1;

                // Cancelar todos los detalles
                String updateDetallesSql = "UPDATE detalles_pedido SET estado = 'cancelado' WHERE pedido_id = ?";
                try (PreparedStatement psDetalles = conn.prepareStatement(updateDetallesSql)) {
                    psDetalles.setInt(1, pedidoId);
                    psDetalles.executeUpdate();
                }

                conn.commit();
                return resultado;
            } else {
                conn.rollback();
                return false;
            }

        } catch (Exception e) {
            try {
                if (conn != null)
                    conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (rs != null)
                    rs.close();
                if (psCheck != null)
                    psCheck.close();
                if (psUpdate != null)
                    psUpdate.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Verifica si un pedido pertenece a un usuario específico.
     * Utilizado para validar permisos antes de modificar un pedido.
     * 
     * @param pedidoId  ID del pedido a verificar
     * @param usuarioId ID del usuario
     * @return true si el pedido pertenece al usuario, false en caso contrario
     */
    public boolean verificarPedidoUsuario(int pedidoId, int usuarioId) {
        String sql = "SELECT COUNT(*) AS count FROM pedidos WHERE id = ? AND usuario_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pedidoId);
            stmt.setInt(2, usuarioId);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("count") > 0;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Crea un pedido temporal solo para guardar preferencias de métodos de pago.
     * Este pedido no es un pedido real, solo se usa para mantener el historial
     * de métodos de pago preferidos del usuario.
     * 
     * @param usuarioId ID del usuario
     * @return ID del pedido temporal creado, o -1 si hay error
     */
    public int crearPedidoTemporal(int usuarioId) {
        int pedidoId = -1;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = AccesoBD.getConnection();

            // Comprobar si existe estado_id=5 (preferencia), si no, usar estado pendiente
            // (1)
            int estadoId = 1; // Pendiente por defecto
            String checkSql = "SELECT id FROM estados WHERE nombre = 'Preferencia' LIMIT 1";
            stmt = conn.prepareStatement(checkSql);
            rs = stmt.executeQuery();
            if (rs.next()) {
                estadoId = rs.getInt("id");
            }

            // Insertar pedido temporal con notas especiales
            String sql = "INSERT INTO pedidos (usuario_id, fecha, estado_id, notas) VALUES (?, NOW(), ?, 'Pedido temporal para preferencia de pago')";
            stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, usuarioId);
            stmt.setInt(2, estadoId);

            int filasAfectadas = stmt.executeUpdate();
            if (filasAfectadas > 0) {
                rs = stmt.getGeneratedKeys();
                if (rs.next()) {
                    pedidoId = rs.getInt(1);
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al crear pedido temporal: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (rs != null)
                    rs.close();
                if (stmt != null)
                    stmt.close();
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return pedidoId;
    }

}