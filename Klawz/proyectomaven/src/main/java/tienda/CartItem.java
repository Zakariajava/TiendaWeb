package tienda;

/**
 * Clase CartItem
 * ------------------------------------------------------------------
 * Esta clase representa un ítem del carrito de compra. Se utiliza
 * para mapear la información enviada desde el cliente en formato JSON
 * durante el proceso de checkout.
 *
 * Contiene el ID del producto y la cantidad seleccionada por el usuario.
 */
public class CartItem {
    private int productId;
    private int quantity;

    /** Constructor vacío necesario para deserialización con Gson */
    public CartItem() {
    }

    /** Devuelve el ID del producto */
    public int getProductId() {
        return productId;
    }

    /** Establece el ID del producto */
    public void setProductId(int productId) {
        this.productId = productId;
    }

    /** Devuelve la cantidad seleccionada del producto */
    public int getQuantity() {
        return quantity;
    }

    /** Establece la cantidad seleccionada del producto */
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
