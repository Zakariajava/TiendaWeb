package tienda;

/**
 * Clase DireccionEnvio
 * -------------------------------------------------------------------
 * Representa la dirección de envío asociada a un pedido específico.
 * Esta clase forma parte de la capa de modelo en la arquitectura MVC.
 * Se utiliza para almacenar los datos relacionados con el lugar de entrega.
 */
public class DireccionEnvio {

    private int id; // ID único de la dirección
    private int pedidoId; // ID del pedido al que está vinculada
    private String domicilio; // Calle, número, piso, etc.
    private String poblacion; // Ciudad o localidad
    private String provincia; // Provincia de envío
    private String cp; // Código postal
    private String telefono; // Teléfono de contacto

    public DireccionEnvio(int pedidoId, String domicilio, String poblacion, String provincia, String cp,
            String telefono) {
        this.pedidoId = pedidoId;
        this.domicilio = domicilio;
        this.poblacion = poblacion;
        this.provincia = provincia;
        this.cp = cp;
        this.telefono = telefono;
    }
    // ------------------- Getters y Setters -------------------

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

    public String getDomicilio() {
        return domicilio;
    }

    public void setDomicilio(String domicilio) {
        this.domicilio = domicilio;
    }

    public String getPoblacion() {
        return poblacion;
    }

    public void setPoblacion(String poblacion) {
        this.poblacion = poblacion;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getCp() {
        return cp;
    }

    public void setCp(String cp) {
        this.cp = cp;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}