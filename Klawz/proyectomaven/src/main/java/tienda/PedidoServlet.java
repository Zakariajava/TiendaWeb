package tienda;

import com.google.gson.Gson;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet PedidoServlet
 * ---------------------------------------------------------------------
 * Este servlet se encarga de gestionar la obtención de los pedidos de un
 * usuario autenticado. Al recibir una solicitud GET, recupera todos los pedidos
 * del
 * usuario, incluyendo sus detalles, y los devuelve en formato JSON.
 */
@WebServlet("/pedido-servlet")
public class PedidoServlet extends HttpServlet {

    /**
     * Método doGet
     * ------------------------------------------------------------------
     * Maneja solicitudes GET al servlet. Verifica que exista sesión
     * y que el usuario esté autenticado. Si es así, consulta todos sus
     * pedidos (con detalles) a través de PedidoDAO y los devuelve en JSON.
     *
     * @param request  petición HTTP del cliente
     * @param response respuesta HTTP del servidor
     * @throws ServletException si hay un error interno de servlet
     * @throws IOException      si hay un problema de entrada/salida
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Validación de sesión y autenticación
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 - No autorizado
            return;
        }

        // Obtener el ID del usuario logueado desde sesión
        int usuarioId = (int) session.getAttribute("usuarioId");

        // Verificar si se solicita información extendida (incluye IDs de detalles)
        boolean extended = "true".equals(request.getParameter("extended"));

        // Obtener pedidos desde la base de datos
        PedidoDAO pedidoDAO = new PedidoDAO();
        List<Pedido> pedidos;

        if (extended) {
            // Obtener pedidos con detalles extendidos que incluyen IDs
            pedidos = pedidoDAO.obtenerPedidosConDetallesExtendidosPorUsuario(usuarioId);
        } else {
            // Método original que no incluye IDs de detalles
            pedidos = pedidoDAO.obtenerPedidosConDetallesPorUsuario(usuarioId);
        }

        // Configurar la respuesta como JSON y devolver los pedidos
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(new Gson().toJson(pedidos));
        out.flush();
    }
}