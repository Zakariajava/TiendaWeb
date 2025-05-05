package tienda;

import com.google.gson.Gson;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet ProductoIndexServlet
 * --------------------------------------------------------
 * Este servlet responde a las solicitudes GET realizadas a la URL
 * /producto-index.
 * Su función principal es devolver un listado completo de productos
 * disponibles,
 * incluyendo sus imágenes, precios, descripción, stock, etc., en formato JSON.
 * 
 * Este servlet es utilizado, por ejemplo, en la página principal (index.jsp)
 * para cargar productos destacados o por categoría/subcategoría mediante AJAX.
 */
@WebServlet("/producto-index")
public class ProductoIndexServlet extends HttpServlet {

    /**
     * Maneja las solicitudes GET al endpoint /producto-index.
     * Devuelve un array JSON con todos los productos del catálogo.
     *
     * @param request  objeto que contiene la solicitud del cliente
     * @param response objeto que contiene la respuesta al cliente
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Crear instancia del DAO para acceder a los productos desde la base de
        // datos
        ProductoDAO dao = new ProductoDAO();

        // 2. Obtener la lista completa de productos con sus respectivas imágenes
        List<Producto> productos = dao.obtenerTodos();

        // 3. Preparar la respuesta JSON
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.print(new Gson().toJson(productos)); // Convertimos la lista a JSON y la escribimos en la respuesta
        out.flush();
    }
}
