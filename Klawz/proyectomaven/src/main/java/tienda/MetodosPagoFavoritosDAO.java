package tienda;

import java.sql.*;
import java.util.*;

/**
 * Clase MetodosPagoFavoritosDAO (Corregida)
 * 
 * Gestiona las operaciones relacionadas con los métodos de pago favoritos
 * guardados por los usuarios en la tabla metodos_pago_favoritos.
 */
public class MetodosPagoFavoritosDAO {

    /**
     * Obtiene todos los métodos de pago favoritos de un usuario
     * 
     * @param usuarioId ID del usuario
     * @return Lista de métodos de pago favoritos, ordenados con el predeterminado
     *         primero
     */
    public List<MetodoPagoFavorito> obtenerPorUsuario(int usuarioId) {
        List<MetodoPagoFavorito> metodos = new ArrayList<>();

        String sql = "SELECT * FROM metodos_pago_favoritos WHERE usuario_id = ? ORDER BY predeterminado DESC, fecha_actualizacion DESC";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                MetodoPagoFavorito metodo = new MetodoPagoFavorito();
                metodo.setId(rs.getInt("id"));
                metodo.setUsuarioId(rs.getInt("usuario_id"));
                metodo.setMetodoPago(rs.getString("metodo_pago"));
                metodo.setNumeroTarjetaHashed(rs.getString("numero_tarjeta_hashed"));
                metodo.setPredeterminado(rs.getBoolean("predeterminado"));
                metodo.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
                metodo.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));

                metodos.add(metodo);
            }

        } catch (SQLException e) {
            System.out.println("Error al obtener métodos de pago favoritos: " + e.getMessage());
            e.printStackTrace();
        }

        return metodos;
    }

    /**
     * Obtiene el método de pago predeterminado de un usuario, si existe
     * 
     * @param usuarioId ID del usuario
     * @return Método de pago predeterminado o null si no tiene ninguno
     */
    public MetodoPagoFavorito obtenerPredeterminado(int usuarioId) {
        String sql = "SELECT * FROM metodos_pago_favoritos WHERE usuario_id = ? AND predeterminado = 1 LIMIT 1";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                MetodoPagoFavorito metodo = new MetodoPagoFavorito();
                metodo.setId(rs.getInt("id"));
                metodo.setUsuarioId(rs.getInt("usuario_id"));
                metodo.setMetodoPago(rs.getString("metodo_pago"));
                metodo.setNumeroTarjetaHashed(rs.getString("numero_tarjeta_hashed"));
                metodo.setPredeterminado(rs.getBoolean("predeterminado"));
                metodo.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
                metodo.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));

                return metodo;
            }

        } catch (SQLException e) {
            System.out.println("Error al obtener método predeterminado: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Guarda un nuevo método de pago favorito
     * CORREGIDO: Mejor validación para tipos de tarjeta y manejo de NULL en SQL
     * 
     * @param metodo Objeto con los datos del método
     * @return true si se guardó correctamente, false en caso contrario
     */
    public boolean guardar(MetodoPagoFavorito metodo) {
        // Validación de datos
        if (metodo == null) {
            System.out.println("Error: Objeto metodo es null");
            return false;
        }

        if (metodo.getUsuarioId() <= 0) {
            System.out.println("Error: usuario_id inválido: " + metodo.getUsuarioId());
            return false;
        }

        if (metodo.getMetodoPago() == null || metodo.getMetodoPago().isEmpty()) {
            System.out.println("Error: metodo_pago es null o vacío");
            return false;
        }

        // SOLUCIÓN: Si es tarjeta, validar que tenga hash
        if ("tarjeta".equals(metodo.getMetodoPago()) && metodo.getNumeroTarjetaHashed() == null) {
            System.out.println("Error: método tipo tarjeta sin numero_tarjeta_hashed");
            return false;
        }

        // Si es predeterminado, primero quitar marca predeterminada de los demás
        if (metodo.isPredeterminado()) {
            quitarMarcaPredeterminada(metodo.getUsuarioId());
        }

        String sql = "INSERT INTO metodos_pago_favoritos (usuario_id, metodo_pago, numero_tarjeta_hashed, predeterminado, fecha_creacion, fecha_actualizacion) "
                + "VALUES (?, ?, ?, ?, NOW(), NOW())";

        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = AccesoBD.getConnection();
            if (conn == null) {
                System.out.println("Error: No se pudo obtener conexión a la base de datos");
                return false;
            }

            stmt = conn.prepareStatement(sql);

            stmt.setInt(1, metodo.getUsuarioId());
            stmt.setString(2, metodo.getMetodoPago());

            // SOLUCIÓN: Establecer el campo como NULL en SQL cuando es null
            if (metodo.getNumeroTarjetaHashed() == null) {
                stmt.setNull(3, java.sql.Types.VARCHAR);
                System.out.println("Estableciendo numero_tarjeta_hashed como NULL");
            } else {
                stmt.setString(3, metodo.getNumeroTarjetaHashed());
                System.out.println("Estableciendo numero_tarjeta_hashed: " + metodo.getNumeroTarjetaHashed());
            }

            stmt.setBoolean(4, metodo.isPredeterminado());

            int resultado = stmt.executeUpdate();
            System.out.println("Filas afectadas por INSERT: " + resultado);

            return resultado > 0;

        } catch (SQLException e) {
            System.out.println("Error SQL al guardar método de pago favorito: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            // Cerrar recursos
            try {
                if (stmt != null)
                    stmt.close();
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                System.out.println("Error al cerrar recursos: " + e.getMessage());
            }
        }
    }

    /**
     * Actualiza un método de pago favorito existente
     * 
     * @param metodo Objeto con los datos del método
     * @return true si se actualizó correctamente, false en caso contrario
     */
    public boolean actualizar(MetodoPagoFavorito metodo) {
        // Si es predeterminado, primero quitar marca predeterminada de los demás
        if (metodo.isPredeterminado()) {
            quitarMarcaPredeterminada(metodo.getUsuarioId());
        }

        String sql = "UPDATE metodos_pago_favoritos SET metodo_pago = ?, numero_tarjeta_hashed = ?, " +
                "predeterminado = ?, fecha_actualizacion = NOW() WHERE id = ? AND usuario_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, metodo.getMetodoPago());

            // SOLUCIÓN: Manejo explícito de NULL para número de tarjeta
            if (metodo.getNumeroTarjetaHashed() == null) {
                stmt.setNull(2, java.sql.Types.VARCHAR);
            } else {
                stmt.setString(2, metodo.getNumeroTarjetaHashed());
            }

            stmt.setBoolean(3, metodo.isPredeterminado());
            stmt.setInt(4, metodo.getId());
            stmt.setInt(5, metodo.getUsuarioId());

            int filas = stmt.executeUpdate();
            return filas > 0;

        } catch (SQLException e) {
            System.out.println("Error al actualizar método de pago favorito: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Establece un método de pago como predeterminado
     * 
     * @param id        ID del método a establecer como predeterminado
     * @param usuarioId ID del usuario propietario
     * @return true si se actualizó correctamente, false en caso contrario
     */
    public boolean establecerPredeterminado(int id, int usuarioId) {
        Connection conn = null;
        try {
            conn = AccesoBD.getConnection();
            conn.setAutoCommit(false);

            // 1. Quitar marca predeterminada de todos los métodos del usuario
            quitarMarcaPredeterminada(conn, usuarioId);

            // 2. Establecer el método seleccionado como predeterminado
            String sql = "UPDATE metodos_pago_favoritos SET predeterminado = 1, fecha_actualizacion = NOW() " +
                    "WHERE id = ? AND usuario_id = ?";

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, id);
                stmt.setInt(2, usuarioId);

                int filas = stmt.executeUpdate();
                if (filas > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            }

        } catch (SQLException e) {
            System.out.println("Error al establecer método predeterminado: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Elimina un método de pago favorito
     * 
     * @param id        ID del método a eliminar
     * @param usuarioId ID del usuario propietario (para verificación)
     * @return true si se eliminó correctamente, false en caso contrario
     */
    public boolean eliminar(int id, int usuarioId) {
        String sql = "DELETE FROM metodos_pago_favoritos WHERE id = ? AND usuario_id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            stmt.setInt(2, usuarioId);

            int filas = stmt.executeUpdate();
            return filas > 0;

        } catch (SQLException e) {
            System.out.println("Error al eliminar método de pago favorito: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Verifica si existe un método similar para el usuario
     * 
     * @param usuarioId           ID del usuario
     * @param metodoPago          Tipo de método de pago
     * @param numeroTarjetaHashed Hash del número de tarjeta (para tarjetas)
     * @return true si existe, false si no
     */
    public boolean existeMetodoSimilar(int usuarioId, String metodoPago, String numeroTarjetaHashed) {
        String sql = "SELECT 1 FROM metodos_pago_favoritos WHERE usuario_id = ? AND metodo_pago = ?";

        // Si hay número de tarjeta, ser más específico
        if (numeroTarjetaHashed != null && !numeroTarjetaHashed.isEmpty()) {
            // Comprobar por los últimos 4 dígitos para mayor flexibilidad
            sql += " AND RIGHT(numero_tarjeta_hashed, 4) = RIGHT(?, 4)";
        }

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            stmt.setString(2, metodoPago);

            if (numeroTarjetaHashed != null && !numeroTarjetaHashed.isEmpty()) {
                stmt.setString(3, numeroTarjetaHashed);
            }

            ResultSet rs = stmt.executeQuery();
            return rs.next();

        } catch (SQLException e) {
            System.out.println("Error al verificar método similar: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Quita la marca de predeterminado de todos los métodos de un usuario
     * 
     * @param usuarioId ID del usuario
     * @return true si se actualizó correctamente, false en caso contrario
     */
    private boolean quitarMarcaPredeterminada(int usuarioId) {
        try (Connection conn = AccesoBD.getConnection()) {
            return quitarMarcaPredeterminada(conn, usuarioId);
        } catch (SQLException e) {
            System.out.println("Error quitando marca predeterminada: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Quita la marca de predeterminado de todos los métodos de un usuario
     * Versión con conexión proporcionada para transacciones
     * 
     * @param conn      Conexión a base de datos
     * @param usuarioId ID del usuario
     * @return true si se actualizó correctamente, false en caso contrario
     */
    private boolean quitarMarcaPredeterminada(Connection conn, int usuarioId) throws SQLException {
        String sql = "UPDATE metodos_pago_favoritos SET predeterminado = 0, fecha_actualizacion = NOW() WHERE usuario_id = ?";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, usuarioId);
            int filas = stmt.executeUpdate();
            return filas >= 0; // Puede no actualizar ninguno si no hay métodos
        }
    }

    /**
     * Obtiene un método de pago favorito por su ID
     * 
     * @param id ID del método de pago
     * @return Objeto MetodoPagoFavorito o null si no existe
     */
    public MetodoPagoFavorito obtenerPorId(int id) {
        String sql = "SELECT * FROM metodos_pago_favoritos WHERE id = ?";

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                MetodoPagoFavorito metodo = new MetodoPagoFavorito();
                metodo.setId(rs.getInt("id"));
                metodo.setUsuarioId(rs.getInt("usuario_id"));
                metodo.setMetodoPago(rs.getString("metodo_pago"));
                metodo.setNumeroTarjetaHashed(rs.getString("numero_tarjeta_hashed"));
                metodo.setPredeterminado(rs.getBoolean("predeterminado"));
                metodo.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
                metodo.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));

                return metodo;
            }

        } catch (SQLException e) {
            System.out.println("Error al obtener método de pago por ID: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Convierte un método de pago favorito al formato de Pago para compatibilidad
     * con el sistema existente
     * 
     * @param favorito El método favorito a convertir
     * @return Un objeto Pago con los datos equivalentes
     */
    public Pago convertirAPago(MetodoPagoFavorito favorito) {
        if (favorito == null)
            return null;

        // Crear un nuevo pago sin vincular a pedido (pedidoId = 0)
        Pago pago = new Pago(0, favorito.getMetodoPago(), favorito.getNumeroTarjetaHashed());
        // Usar el mismo ID para mantener referencia (aunque no es el mismo tipo de ID)
        pago.setId(favorito.getId());

        return pago;
    }
}