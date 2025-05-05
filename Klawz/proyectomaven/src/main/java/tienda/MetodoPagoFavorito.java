package tienda;

import java.sql.Timestamp;

/**
 * Clase MetodoPagoFavorito
 * Representa un método de pago guardado por un usuario para futuras compras
 */
public class MetodoPagoFavorito {
    private int id;
    private int usuarioId;
    private String metodoPago;
    private String numeroTarjetaHashed;
    private boolean predeterminado;
    private Timestamp fechaCreacion;
    private Timestamp fechaActualizacion;

    // Constructor por defecto
    public MetodoPagoFavorito() {
    }

    // Constructor para nuevos métodos
    public MetodoPagoFavorito(int usuarioId, String metodoPago, String numeroTarjetaHashed, boolean predeterminado) {
        this.usuarioId = usuarioId;
        this.metodoPago = metodoPago;
        this.numeroTarjetaHashed = numeroTarjetaHashed;
        this.predeterminado = predeterminado;
    }

    // Getters y setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
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

    public boolean isPredeterminado() {
        return predeterminado;
    }

    public void setPredeterminado(boolean predeterminado) {
        this.predeterminado = predeterminado;
    }

    public Timestamp getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Timestamp fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Timestamp getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(Timestamp fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}