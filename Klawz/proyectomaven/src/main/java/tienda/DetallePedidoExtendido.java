package tienda;

/**
 * Clase DetallePedidoExtendido
 * ------------------------------------------------------------
 * Versión extendida de DetallePedido que incluye información adicional
 * para la gestión de pedidos, especialmente para la cancelación parcial.
 * Añade:
 * - ID del producto
 * - Estado del detalle (activo, cancelado)
 * - ID del pedido
 */
public class DetallePedidoExtendido extends DetallePedido {

    /** ID del producto asociado */
    private int productoId;

    /** ID del pedido al que pertenece */
    private int pedidoId;

    /** Estado del detalle (activo, cancelado) */
    private String estado;

    /**
     * Constructor completo para datos provenientes de la base de datos.
     */
    public DetallePedidoExtendido(int id, int pedidoId, int productoId, String nombreProducto,
            int cantidad, double precio, String estado) {
        super(id, nombreProducto, cantidad, precio);
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.estado = estado;
    }

    // Getters y setters
    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public int getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(int pedidoId) {
        this.pedidoId = pedidoId;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    /**
     * Indica si el detalle está activo (no cancelado).
     * 
     * @return true si está activo, false si está cancelado
     */
    public boolean isActivo() {
        return "activo".equalsIgnoreCase(estado);
    }
}