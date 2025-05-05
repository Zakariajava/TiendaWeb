package tienda;

import java.util.List;

/**
 * Clase Producto
 * ---------------------------------------------------------------
 * Esta clase representa un producto dentro de la tienda online.
 * Contiene información relevante para su presentación, gestión de stock,
 * y categorización por tipo y subcategoría.
 */
public class Producto {
    private int id;
    private String nombre;
    private double precio;
    private String descripcion;
    private boolean destacado; // Indica si el producto es destacado (para portada o promociones)
    private int categoriaId; // ID numérico de la categoría (1 = Hombre, 2 = Mujer, etc.)
    private int subcategoriaId; // ID numérico de la subcategoría (1 = Abrigos, etc.)
    private List<String> imagenes; // Lista de URLs o rutas relativas a las imágenes del producto
    private int stock; // Cantidad disponible del producto

    // =============================
    // Getters y Setters
    // =============================

    /**
     * Obtiene el stock disponible del producto.
     */
    public int getStock() {
        return stock;
    }

    /**
     * Establece el stock disponible del producto.
     */
    public void setStock(int stock) {
        this.stock = stock;
    }

    /**
     * Devuelve la lista de imágenes asociadas al producto.
     */
    public List<String> getImagenes() {
        return imagenes;
    }

    /**
     * Establece la lista de imágenes para el producto.
     */
    public void setImagenes(List<String> imagenes) {
        this.imagenes = imagenes;
    }

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

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isDestacado() {
        return destacado;
    }

    public void setDestacado(boolean destacado) {
        this.destacado = destacado;
    }

    public int getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(int categoriaId) {
        this.categoriaId = categoriaId;
    }

    public int getSubcategoriaId() {
        return subcategoriaId;
    }

    public void setSubcategoriaId(int subcategoriaId) {
        this.subcategoriaId = subcategoriaId;
    }

    // =============================
    // Métodos auxiliares
    // =============================

    /**
     * Devuelve el nombre textual de la categoría a partir de su ID.
     * 
     * @return "hombre", "mujer", "niño" u "otro"
     */
    public String getCategory() {
        switch (categoriaId) {
            case 1:
                return "hombre";
            case 2:
                return "mujer";
            case 3:
                return "niño";
            default:
                return "otro";
        }
    }

    /**
     * Devuelve el nombre textual de la subcategoría a partir de su ID.
     * 
     * @return "abrigos", "camisetas", "relojes", "zapatillas", etc.
     */
    public String getSubcategory() {
        switch (subcategoriaId) {
            case 1:
                return "abrigos";
            case 2:
                return "camisetas";
            case 3:
                return "relojes";
            case 4:
                return "zapatillas";
            case 5:
                return "abrigos";
            case 6:
                return "vestidos";
            case 7:
                return "relojes";
            case 8:
                return "zapatillas";
            case 9:
                return "chaquetas";
            case 10:
                return "zapatillas";
            default:
                return "otro";
        }
    }
}
