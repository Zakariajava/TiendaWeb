package tienda;

import java.util.Date;

/**
 * Clase Mensaje
 * --------------------------------------------------------------
 * Esta clase representa un mensaje enviado por un cliente a través
 * del formulario de contacto. Almacena la información básica del
 * remitente y el contenido del mensaje.
 */
public class Mensaje {

    /** ID único del mensaje en la base de datos */
    private int id;

    /** Nombre del remitente */
    private String nombre;

    /** Correo electrónico del remitente */
    private String email;

    /** Contenido del mensaje */
    private String contenido;

    /** Fecha y hora de recepción del mensaje */
    private Date fechaRecepcion;

    /** Estado del mensaje (leído/no leído) */
    private boolean leido;

    /**
     * Constructor vacío necesario para JavaBean.
     */
    public Mensaje() {
    }

    /**
     * Constructor con los campos básicos para crear un nuevo mensaje.
     * 
     * @param nombre    Nombre del remitente
     * @param email     Correo electrónico del remitente
     * @param contenido Contenido del mensaje
     */
    public Mensaje(String nombre, String email, String contenido) {
        this.nombre = nombre;
        this.email = email;
        this.contenido = contenido;
        this.fechaRecepcion = new Date(); // Fecha actual
        this.leido = false; // Por defecto, no leído
    }

    /**
     * Constructor completo con todos los campos.
     * 
     * @param id             ID único del mensaje
     * @param nombre         Nombre del remitente
     * @param email          Correo electrónico del remitente
     * @param contenido      Contenido del mensaje
     * @param fechaRecepcion Fecha y hora de recepción
     * @param leido          Estado de lectura del mensaje
     */
    public Mensaje(int id, String nombre, String email, String contenido,
            Date fechaRecepcion, boolean leido) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.contenido = contenido;
        this.fechaRecepcion = fechaRecepcion;
        this.leido = leido;
    }

    // Getters y setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public Date getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(Date fechaRecepcion) {
        this.fechaRecepcion = fechaRecepcion;
    }

    public boolean isLeido() {
        return leido;
    }

    public void setLeido(boolean leido) {
        this.leido = leido;
    }
}