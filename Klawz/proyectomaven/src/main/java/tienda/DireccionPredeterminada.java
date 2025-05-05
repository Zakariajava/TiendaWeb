package tienda;

/**
 * Clase DireccionPredeterminada
 * ------------------------------------------------------------------
 * Representa la dirección de envío predeterminada de un usuario.
 * Se utiliza para precargar los formularios de compra y facilitar
 * futuras compras al cliente.
 */
public class DireccionPredeterminada {
    private int id;
    private int usuarioId;
    private String domicilio;
    private String poblacion;
    private String provincia;
    private String cp;
    private String telefono;

    // Constructor completo
    public DireccionPredeterminada(int usuarioId, String domicilio, String poblacion,
            String provincia, String cp, String telefono) {
        this.usuarioId = usuarioId;
        this.domicilio = domicilio;
        this.poblacion = poblacion;
        this.provincia = provincia;
        this.cp = cp;
        this.telefono = telefono;
    }

    // Constructor vacío para JavaBeans
    public DireccionPredeterminada() {
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