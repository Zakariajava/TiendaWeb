package tienda;

/**
 * Clase Usuario
 * -------------------------------------------------------------
 * Esta clase representa un usuario del sistema y actúa como un JavaBean.
 * Se utiliza para mapear los datos de la tabla "usuarios" de la base de datos
 * y facilitar su manipulación dentro de la lógica de negocio.
 *
 * Contiene información personal, de contacto, y de autenticación.
 */
public class Usuario {

    // Atributos privados que representan las columnas de la tabla "usuarios"
    private int id;
    private String nombre;
    private String apellidos;
    private String domicilio;
    private String poblacion;
    private String provincia;
    private String cp;
    private String telefono;
    private String email;
    private String clave; // Contraseña del usuario, almacenada en formato hasheado
    private boolean activo; // Indica si la cuenta está activa
    private boolean admin; // Indica si el usuario tiene privilegios de administrador

    /**
     * Constructor vacío necesario para el funcionamiento como JavaBean.
     * Permite instanciar el objeto sin inicializar sus atributos.
     */
    public Usuario() {
    }

    /** Getter del ID del usuario */
    public int getId() {
        return id;
    }

    /** Setter del ID del usuario */
    public void setId(int id) {
        this.id = id;
    }

    /** Getter del nombre del usuario */
    public String getNombre() {
        return nombre;
    }

    /** Setter del nombre del usuario */
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    /** Getter de los apellidos del usuario */
    public String getApellidos() {
        return apellidos;
    }

    /** Setter de los apellidos del usuario */
    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    /** Getter del domicilio del usuario */
    public String getDomicilio() {
        return domicilio;
    }

    /** Setter del domicilio del usuario */
    public void setDomicilio(String domicilio) {
        this.domicilio = domicilio;
    }

    /** Getter de la población del usuario */
    public String getPoblacion() {
        return poblacion;
    }

    /** Setter de la población del usuario */
    public void setPoblacion(String poblacion) {
        this.poblacion = poblacion;
    }

    /** Getter de la provincia del usuario */
    public String getProvincia() {
        return provincia;
    }

    /** Setter de la provincia del usuario */
    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    /** Getter del código postal del usuario */
    public String getCp() {
        return cp;
    }

    /** Setter del código postal del usuario */
    public void setCp(String cp) {
        this.cp = cp;
    }

    /** Getter del teléfono del usuario */
    public String getTelefono() {
        return telefono;
    }

    /** Setter del teléfono del usuario */
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    /** Getter del correo electrónico del usuario */
    public String getEmail() {
        return email;
    }

    /** Setter del correo electrónico del usuario */
    public void setEmail(String email) {
        this.email = email;
    }

    /** Getter de la contraseña hasheada del usuario */
    public String getClave() {
        return clave;
    }

    /** Setter de la contraseña hasheada del usuario */
    public void setClave(String clave) {
        this.clave = clave;
    }

    /** Getter que indica si el usuario está activo */
    public boolean isActivo() {
        return activo;
    }

    /** Setter que define si el usuario está activo */
    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    /** Getter que indica si el usuario tiene rol de administrador */
    public boolean isAdmin() {
        return admin;
    }

    /** Setter que define si el usuario tiene rol de administrador */
    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}
