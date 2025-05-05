package tienda;

import com.google.gson.Gson;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;

/**
 * Servlet ProductoDetalleServlet
 * --------------------------------------------------------
 * Este servlet se encarga de procesar las peticiones GET que solicitan
 * la información detallada de un producto específico a partir de su ID.
 * Devuelve los datos del producto en formato JSON, incluyendo imágenes,
 * categoría, subcategoría y stock actual.
 *
 * Ruta mapeada: /producto-detalle
 */
@WebServlet("/producto-detalle")
public class ProductoDetalleServlet extends HttpServlet {

    /**
     * Método que maneja solicitudes GET para obtener los detalles de un producto.
     *
     * @param request  objeto que contiene la solicitud HTTP del cliente
     * @param response objeto que contiene la respuesta HTTP para el cliente
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Obtener el parámetro "id" de la URL
        String idParam = request.getParameter("id");

        // 2. Validar que el parámetro no esté vacío
        if (idParam == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Falta el parámetro id");
            return;
        }

        int id;
        try {
            // 3. Intentar convertir el parámetro a entero
            id = Integer.parseInt(idParam);
        } catch (NumberFormatException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID no válido");
            return;
        }

        // 4. Buscar el producto en la base de datos
        ProductoDAO dao = new ProductoDAO();
        Producto producto = dao.obtenerPorId(id);

        // 5. Comprobar si el producto existe
        if (producto == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Producto no encontrado");
            return;
        }

        // 6. Construir un mapa con los datos del producto para transformarlo a JSON
        HashMap<String, Object> productoMap = new HashMap<>();
        productoMap.put("id", producto.getId());
        productoMap.put("nombre", producto.getNombre());
        productoMap.put("precio", producto.getPrecio());
        productoMap.put("descripcion", producto.getDescripcion());
        productoMap.put("destacado", producto.isDestacado());
        productoMap.put("categoriaId", producto.getCategoriaId());
        productoMap.put("subcategoriaId", producto.getSubcategoriaId());
        productoMap.put("imagenes", producto.getImagenes());
        productoMap.put("category", producto.getCategory()); // categoría como texto
        productoMap.put("subcategory", producto.getSubcategory()); // subcategoría como texto
        productoMap.put("stock", producto.getStock()); // stock actual

        // 7. Preparar la respuesta en formato JSON
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.print(new Gson().toJson(productoMap));
        out.flush();
    }
}
