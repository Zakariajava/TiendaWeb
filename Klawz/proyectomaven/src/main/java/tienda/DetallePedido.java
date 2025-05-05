package tienda;

/**
 * Clase DetallePedido
 * ------------------------------------------------------------
 * Esta clase representa un objeto que modela un detalle individual
 * de un pedido realizado por el usuario. Es utilizada para almacenar
 * información relevante de cada línea del pedido:
 * - Nombre del producto comprado
 * - Cantidad de unidades adquiridas
 * - Precio unitario del producto en el momento de la compra
 * 
 * Este bean es especialmente útil para mostrar los pedidos
 * del usuario en la interfaz de gestión o confirmación.
 * 
 * Versión actualizada: Incluye campo ID opcional para identificar el detalle.
 */
public class DetallePedido {

    /** ID del detalle (opcional, puede ser nulo si no se proporciona) */
    private Integer id;

    /** Nombre del producto en el pedido */
    private String nombreProducto;

    /** Cantidad de unidades compradas */
    private int cantidad;

    /** Precio unitario del producto */
    private double precio;

    /**
     * Constructor principal.
     * 
     * @param nombreProducto Nombre del producto
     * @param cantidad       Cantidad de unidades adquiridas
     * @param precio         Precio unitario del producto
     */
    public DetallePedido(String nombreProducto, int cantidad, double precio) {
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.precio = precio;
    }

    /**
     * Constructor extendido con ID.
     * 
     * @param id             ID del detalle
     * @param nombreProducto Nombre del producto
     * @param cantidad       Cantidad de unidades adquiridas
     * @param precio         Precio unitario del producto
     */
    public DetallePedido(Integer id, String nombreProducto, int cantidad, double precio) {
        this.id = id;
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.precio = precio;
    }

    /**
     * Devuelve el ID del detalle (puede ser nulo).
     * 
     * @return ID del detalle o null
     */
    public Integer getId() {
        return id;
    }

    /**
     * Establece el ID del detalle.
     * 
     * @param id ID del detalle
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Devuelve el nombre del producto.
     * 
     * @return nombre del producto comprado
     */
    public String getNombreProducto() {
        return nombreProducto;
    }

    /**
     * Devuelve la cantidad comprada de este producto.
     * 
     * @return número de unidades
     */
    public int getCantidad() {
        return cantidad;
    }

    /**
     * Devuelve el precio del producto.
     * 
     * @return precio unitario en el pedido
     */
    public double getPrecio() {
        return precio;
    }

    /**
     * Establece el nombre del producto.
     * 
     * @param nombreProducto Nombre del producto
     */
    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    /**
     * Establece la cantidad de unidades.
     * 
     * @param cantidad Cantidad de unidades
     */
    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    /**
     * Establece el precio unitario.
     * 
     * @param precio Precio unitario
     */
    public void setPrecio(double precio) {
        this.precio = precio;
    }
}