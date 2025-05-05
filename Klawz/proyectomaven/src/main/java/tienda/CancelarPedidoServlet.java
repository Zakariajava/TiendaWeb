package tienda;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet CancelarPedidoServlet
 * ------------------------------------------------------
 * Este servlet gestiona la lógica para permitir al usuario cancelar un pedido.
 * Solo se permite cancelar un pedido si el usuario está autenticado (sesión
 * activa)
 * y si el pedido aún se encuentra en estado "pendiente".
 *
 * El servlet recibe un parámetro `pedidoId` desde una petición AJAX tipo POST.
 * Valida que el pedido pertenezca al usuario logueado y que su estado sea
 * cancelable.
 * Si se cumplen los requisitos, se cancela en base de datos.
 *
 * Mapea la URL: /cancelar-pedido
 */
@WebServlet("/cancelar-pedido")
public class CancelarPedidoServlet extends HttpServlet {

    /**
     * Método doPost
     * -----------------------------------------------------
     * Procesa la cancelación de un pedido a través de una petición POST.
     * Verifica que el usuario esté autenticado y que el pedido pertenezca a él.
     * Devuelve una respuesta en formato JSON indicando el éxito o fallo de la
     * operación.
     *
     * Parámetros requeridos:
     * - pedidoId (int): ID del pedido a cancelar.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Verificar que el usuario tiene sesión activa
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            // Usuario no autenticado
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            return;
        }

        // Recuperar ID de usuario desde sesión
        int usuarioId = (int) session.getAttribute("usuarioId");

        // Obtener el ID del pedido desde los parámetros de la solicitud
        int pedidoId = Integer.parseInt(request.getParameter("pedidoId"));

        // Invocar al DAO para intentar cancelar el pedido si está pendiente
        PedidoDAO dao = new PedidoDAO();
        boolean exito = dao.cancelarPedidoSiPendiente(pedidoId, usuarioId);

        // Devolver respuesta en formato JSON
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print("{\"success\": " + exito + "}");
        out.flush();
    }
}
