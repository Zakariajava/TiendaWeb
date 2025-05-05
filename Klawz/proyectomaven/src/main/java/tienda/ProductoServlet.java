package tienda;

import com.google.gson.Gson;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.util.List;

/**
 * Servlet ProductoServlet
 * ------------------------------------------------------------------
 * Este servlet gestiona la obtención de todos los productos del catálogo
 * y sirve dos propósitos dependiendo del contexto:
 * 
 * 1. Si se invoca con el parámetro `?ajax=true`, responde con los productos
 * en formato JSON (utilizado por peticiones AJAX desde JavaScript).
 * 2. Si no se pasa el parámetro, redirige a la vista `shop.jsp` con los
 * productos cargados como atributo de la petición.
 *
 * Este enfoque permite reutilizar el mismo servlet tanto en peticiones
 * síncronas
 * como en peticiones asíncronas desde el frontend.
 */
@WebServlet("/productos")
public class ProductoServlet extends HttpServlet {

    /**
     * Método GET que devuelve todos los productos.
     * Si se especifica `ajax=true`, responde con JSON. Si no, reenvía a la vista.
     *
     * @param request  solicitud HTTP recibida
     * @param response respuesta HTTP a enviar
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Obtener productos desde base de datos
        ProductoDAO dao = new ProductoDAO();
        List<Producto> productos = dao.obtenerTodos();

        // 2. Comprobar si se trata de una solicitud AJAX
        if ("true".equals(request.getParameter("ajax"))) {
            // Enviar JSON como respuesta para peticiones AJAX
            response.setContentType("application/json;charset=UTF-8");
            String json = new Gson().toJson(productos);
            response.getWriter().write(json);
        } else {
            // Enviar lista de productos a la vista JSP (shop.jsp)
            request.setAttribute("productos", productos);
            request.getRequestDispatcher("/html/shop.jsp").forward(request, response);
        }
    }
}
