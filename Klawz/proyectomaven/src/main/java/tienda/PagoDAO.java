package tienda;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase PagoDAO (Mejorada)
 * --------------------------------------------------------------
 * Esta clase gestiona las operaciones relacionadas con los métodos
 * de pago registrados en la base de datos.
 *
 * IMPORTANTE: Los métodos de pago están vinculados a pedidos (no directamente a
 * usuarios).
 * Para mostrar los "métodos guardados" del usuario, se extraen de su historial
 * de pedidos.
 *
 * Forma parte de la capa de acceso a datos (DAO) siguiendo el patrón MVC.
 */
public class PagoDAO {

    /**
     * Inserta un nuevo registro de pago vinculado a un pedido.
     *
     * @param pago Objeto Pago con los datos a almacenar
     * @throws SQLException si ocurre un error en la inserción
     */
    public void insertarPago(Pago pago) throws SQLException {
        String sql = "INSERT INTO pagos (pedido_id, metodo_pago, numero_tarjeta_hashed) VALUES (?, ?, ?)";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pago.getPedidoId());
            stmt.setString(2, pago.getMetodoPago());
            stmt.setString(3, pago.getNumeroTarjetaHashed());
            stmt.executeUpdate();
        }
    }

    /**
     * Recupera la información de pago de un pedido específico.
     *
     * @param pedidoId ID del pedido
     * @return Objeto Pago o null si no se encuentra
     * @throws SQLException si ocurre un error en la consulta
     */
    public Pago obtenerPorPedidoId(int pedidoId) throws SQLException {
        String sql = "SELECT * FROM pagos WHERE pedido_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pedidoId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Pago pago = new Pago(
                        rs.getInt("pedido_id"),
                        rs.getString("metodo_pago"),
                        rs.getString("numero_tarjeta_hashed"));
                pago.setId(rs.getInt("id"));
                return pago;
            }
        }
        return null;
    }

    /**
     * Obtiene los métodos de pago utilizados por un usuario en sus pedidos
     * anteriores.
     * Este método recupera los métodos de pago "favoritos" del usuario basados en
     * su
     * historial de compras, no en una tabla separada de favoritos.
     *
     * @param usuarioId ID del usuario
     * @return Lista de objetos Pago con la información parcial
     */
    public List<Pago> obtenerMetodosPagoUsuario(int usuarioId) {
        List<Pago> metodosPago = new ArrayList<>();

        // SQL mejorado para obtener los métodos de pago únicos del usuario
        // Versión simplificada para depuración
        String sql = "SELECT DISTINCT p.id, p.metodo_pago, p.numero_tarjeta_hashed " +
                "FROM pagos p " +
                "JOIN pedidos pe ON p.pedido_id = pe.id " +
                "WHERE pe.usuario_id = ? " +
                "ORDER BY p.fecha DESC " +
                "LIMIT 10";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);

            System.out.println("Ejecutando consulta de métodos de pago para usuario: " + usuarioId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Pago pago = new Pago(0, rs.getString("metodo_pago"), rs.getString("numero_tarjeta_hashed"));
                pago.setId(rs.getInt("id"));

                // Log de seguimiento
                System.out.println("Método de pago encontrado - ID: " + pago.getId() +
                        ", Tipo: " + pago.getMetodoPago());

                metodosPago.add(pago);
            }

        } catch (SQLException e) {
            System.out.println("Error en obtenerMetodosPagoUsuario: " + e.getMessage());
            e.printStackTrace();
        }

        return metodosPago;
    }

    /**
     * Actualiza los datos de un método de pago existente.
     * Solo se puede actualizar el método de pago y el número de tarjeta.
     *
     * @param pagoId              ID del pago a actualizar
     * @param metodoPago          Nuevo método de pago
     * @param numeroTarjetaHashed Nuevo hash del número de tarjeta (null si no
     *                            cambia)
     * @param usuarioId           ID del usuario propietario (para verificación)
     * @return true si se actualizó correctamente, false si hubo un error
     */
    public boolean actualizarMetodoPago(int pagoId, String metodoPago, String numeroTarjetaHashed, int usuarioId) {
        // Primero verificamos que el pago pertenezca al usuario
        String checkSql = "SELECT COUNT(*) AS count FROM pagos p " +
                "JOIN pedidos pe ON p.pedido_id = pe.id " +
                "WHERE p.id = ? AND pe.usuario_id = ?";

        try (Connection conn = AccesoBD.getConnection()) {
            // Verificar propiedad
            boolean autorizado = false;
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setInt(1, pagoId);
                checkStmt.setInt(2, usuarioId);
                ResultSet rs = checkStmt.executeQuery();

                if (rs.next() && rs.getInt("count") > 0) {
                    autorizado = true;
                }
            }

            if (!autorizado) {
                System.out.println("Verificación de propiedad fallida: el pago ID " + pagoId +
                        " no pertenece al usuario ID " + usuarioId);
                return false;
            }

            // Determinar qué actualizar según si se proporciona nuevo número de tarjeta
            String updateSql = (numeroTarjetaHashed != null)
                    ? "UPDATE pagos SET metodo_pago = ?, numero_tarjeta_hashed = ? WHERE id = ?"
                    : "UPDATE pagos SET metodo_pago = ? WHERE id = ?";

            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setString(1, metodoPago);

                if (numeroTarjetaHashed != null) {
                    updateStmt.setString(2, numeroTarjetaHashed);
                    updateStmt.setInt(3, pagoId);
                } else {
                    updateStmt.setInt(2, pagoId);
                }

                int filas = updateStmt.executeUpdate();
                System.out.println("Filas actualizadas: " + filas);
                return filas > 0;
            }

        } catch (SQLException e) {
            System.out.println("Error SQL en actualizarMetodoPago: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Verifica si un método de pago ya ha sido utilizado por el usuario.
     * Útil para evitar guardar múltiples veces el mismo número de tarjeta.
     * 
     * @param usuarioId           ID del usuario
     * @param metodoPago          Tipo de método de pago
     * @param numeroTarjetaHashed Hash del número de tarjeta (o null)
     * @return true si ya existe, false si no
     */
    public boolean existeMetodoPagoUsuario(int usuarioId, String metodoPago, String numeroTarjetaHashed) {
        String sql = "SELECT 1 FROM pagos p " +
                "JOIN pedidos pe ON p.pedido_id = pe.id " +
                "WHERE pe.usuario_id = ? AND p.metodo_pago = ?";

        // Si hay número de tarjeta, ser más específico en la búsqueda
        if (numeroTarjetaHashed != null) {
            sql += " AND (p.numero_tarjeta_hashed = ? " +
                    "OR RIGHT(p.numero_tarjeta_hashed, 4) = RIGHT(?, 4))";
        }

        sql += " LIMIT 1";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            stmt.setString(2, metodoPago);

            if (numeroTarjetaHashed != null) {
                stmt.setString(3, numeroTarjetaHashed);
                stmt.setString(4, numeroTarjetaHashed);
            }

            ResultSet rs = stmt.executeQuery();
            return rs.next(); // true si existe al menos un resultado

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
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

    /**
     * Recupera un pago específico por su ID.
     *
     * @param pagoId ID del pago a recuperar
     * @return Objeto Pago con los datos o null si no existe
     */
    public Pago obtenerPorId(int pagoId) {
        String sql = "SELECT * FROM pagos WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pagoId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Pago pago = new Pago(
                        rs.getInt("pedido_id"),
                        rs.getString("metodo_pago"),
                        rs.getString("numero_tarjeta_hashed"));
                pago.setId(rs.getInt("id"));
                return pago;
            }
        } catch (SQLException e) {
            System.out.println("Error al recuperar pago: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

}