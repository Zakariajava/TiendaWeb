package tienda;

import java.util.Date;
import java.util.List;

/**
 * Clase Pedido
 * --------------------------------------------------------------------
 * Esta clase representa un pedido realizado por un usuario en la tienda.
 * Contiene información general como el ID del pedido, la fecha de creación,
 * el estado del pedido y la lista de detalles asociados a dicho pedido.
 */
public class Pedido {

    /** Identificador único del pedido */
    private int id;

    /** Fecha en que se creó el pedido */
    private Date fecha;

    /** Estado actual del pedido (ej. Pendiente, Enviado, Cancelado) */
    private String estado;

    /** Lista de productos incluidos en el pedido con cantidad y precio */
    private List<DetallePedido> detalles;

    // ------------------- Getters y Setters -------------------

    /**
     * Devuelve el ID del pedido
     * 
     * @return id del pedido
     */
    public int getId() {
        return id;
    }

    /**
     * Establece el ID del pedido
     * 
     * @param id identificador único
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Devuelve la fecha en la que se creó el pedido
     * 
     * @return fecha del pedido
     */
    public Date getFecha() {
        return fecha;
    }

    /**
     * Establece la fecha de creación del pedido
     * 
     * @param fecha fecha del pedido
     */
    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    /**
     * Devuelve el estado actual del pedido
     * 
     * @return estado del pedido
     */
    public String getEstado() {
        return estado;
    }

    /**
     * Establece el estado del pedido (ej. Pendiente, Enviado, Cancelado)
     * 
     * @param estado nuevo estado del pedido
     */
    public void setEstado(String estado) {
        this.estado = estado;
    }

    /**
     * Devuelve la lista de detalles del pedido
     * 
     * @return lista de objetos DetallePedido
     */
    public List<DetallePedido> getDetalles() {
        return detalles;
    }

    /**
     * Establece los detalles del pedido (productos, cantidad, precios)
     * 
     * @param detalles lista de DetallePedido
     */
    public void setDetalles(List<DetallePedido> detalles) {
        this.detalles = detalles;
    }
}
