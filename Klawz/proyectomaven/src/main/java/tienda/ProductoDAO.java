package tienda;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Clase ProductoDAO
 * --------------------------------------------------------------
 * Esta clase se encarga del acceso a la base de datos para operaciones
 * relacionadas con los productos. Implementa métodos para obtener la lista
 * completa de productos o un producto concreto a partir de su ID.
 */
public class ProductoDAO {

    /**
     * Recupera todos los productos de la base de datos con sus respectivas
     * imágenes.
     *
     * @return lista de productos, cada uno con sus atributos y lista de imágenes
     */
    public List<Producto> obtenerTodos() {
        String sql = "SELECT p.id, p.nombre, p.precio, p.descripcion, p.destacado, p.categoria_id, p.subcategoria_id, p.stock, "
                + "i.url AS imagen FROM productos p "
                + "LEFT JOIN imagenes_producto i ON p.id = i.producto_id";

        // Usamos un mapa para evitar repetir productos en caso de múltiples imágenes
        Map<Integer, Producto> productos = new HashMap<>();

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                int pid = rs.getInt("id");
                Producto prod = productos.get(pid);

                // Si el producto aún no está en el mapa, lo creamos
                if (prod == null) {
                    prod = new Producto();
                    prod.setId(pid);
                    prod.setNombre(rs.getString("nombre"));
                    prod.setPrecio(rs.getDouble("precio"));
                    prod.setDescripcion(rs.getString("descripcion"));
                    prod.setDestacado(rs.getBoolean("destacado"));
                    prod.setCategoriaId(rs.getInt("categoria_id"));
                    prod.setSubcategoriaId(rs.getInt("subcategoria_id"));
                    prod.setStock(rs.getInt("stock"));
                    prod.setImagenes(new ArrayList<>());
                    productos.put(pid, prod);
                }

                // Añadimos imagen si existe
                String imagen = rs.getString("imagen");
                if (imagen != null && !imagen.isEmpty()) {
                    prod.getImagenes().add(imagen);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Devolvemos la lista de productos
        return new ArrayList<>(productos.values());
    }

    /**
     * Obtiene un producto específico por su ID, incluyendo sus imágenes.
     *
     * @param id identificador del producto a buscar
     * @return el producto encontrado o null si no existe
     */
    public Producto obtenerPorId(int id) {
        String sql = "SELECT p.id, p.nombre, p.precio, p.descripcion, p.destacado, p.categoria_id, p.subcategoria_id, p.stock, "
                + "i.url AS imagen FROM productos p "
                + "LEFT JOIN imagenes_producto i ON p.id = i.producto_id "
                + "WHERE p.id = ?";

        Map<Integer, Producto> productos = new HashMap<>();

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                int pid = rs.getInt("id");
                Producto prod = productos.get(pid);

                // Creamos el producto si aún no existe
                if (prod == null) {
                    prod = new Producto();
                    prod.setId(pid);
                    prod.setNombre(rs.getString("nombre"));
                    prod.setPrecio(rs.getDouble("precio"));
                    prod.setDescripcion(rs.getString("descripcion"));
                    prod.setDestacado(rs.getBoolean("destacado"));
                    prod.setCategoriaId(rs.getInt("categoria_id"));
                    prod.setSubcategoriaId(rs.getInt("subcategoria_id"));
                    prod.setStock(rs.getInt("stock"));
                    prod.setImagenes(new ArrayList<>());
                    productos.put(pid, prod);
                }

                // Añadir imagen si está presente
                String imagen = rs.getString("imagen");
                if (imagen != null && !imagen.isEmpty()) {
                    prod.getImagenes().add(imagen);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Devuelve el primer (y único) producto en el mapa, o null si no se encontró
        return productos.values().stream().findFirst().orElse(null);
    }

    /**
     * Recupera el stock actual desde la base de datos de los productos
     * indicados en la lista del carrito.
     *
     * @param items Lista de productos del carrito (con IDs)
     * @return Mapa con productId -> stock actual
     */
    public Map<Integer, Integer> obtenerStockDeProductos(List<CartItem> items) {
        Map<Integer, Integer> stockMap = new HashMap<>();

        if (items == null || items.isEmpty()) {
            return stockMap;
        }

        // Construir cláusula IN dinámicamente con ?
        StringBuilder queryBuilder = new StringBuilder("SELECT id, stock FROM productos WHERE id IN (");
        for (int i = 0; i < items.size(); i++) {
            queryBuilder.append("?");
            if (i < items.size() - 1)
                queryBuilder.append(", ");
        }
        queryBuilder.append(")");

        try (Connection conn = AccesoBD.getConnection();
                PreparedStatement stmt = conn.prepareStatement(queryBuilder.toString())) {

            // Asignar parámetros
            for (int i = 0; i < items.size(); i++) {
                stmt.setInt(i + 1, items.get(i).getProductId());
            }

            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                int id = rs.getInt("id");
                int stock = rs.getInt("stock");
                stockMap.put(id, stock);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return stockMap;
    }
}
