package tienda;

/**
 * Clase Pago
 * -------------------------------------------------------------------
 * Representa la información de pago asociada a un pedido.
 * Incluye el método utilizado y, opcionalmente, una versión cifrada
 * del número de tarjeta si se trata de pago con tarjeta.
 *
 * Forma parte de la capa de modelo en la arquitectura MVC.
 */
public class Pago {

    private int id; // ID único del registro de pago
    private int pedidoId; // ID del pedido al que corresponde
    private String metodoPago; // Tipo de pago: Tarjeta, Bizum, etc.
    private String numeroTarjetaHashed; // Número cifrado (si aplica)

    // ------------------- Getters y Setters -------------------
    public Pago(int pedidoId, String metodoPago, String numeroTarjetaHashed) {
        this.pedidoId = pedidoId;
        this.metodoPago = metodoPago;
        this.numeroTarjetaHashed = numeroTarjetaHashed;

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(int pedidoId) {
        this.pedidoId = pedidoId;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getNumeroTarjetaHashed() {
        return numeroTarjetaHashed;
    }

    public void setNumeroTarjetaHashed(String numeroTarjetaHashed) {
        this.numeroTarjetaHashed = numeroTarjetaHashed;
    }
}
