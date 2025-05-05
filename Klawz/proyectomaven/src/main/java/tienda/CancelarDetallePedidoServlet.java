package tienda;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet CancelarDetallePedidoServlet (Mejorado)
 * ------------------------------------------------------
 * Este servlet gestiona la lógica para permitir al usuario cancelar
 * un producto específico dentro de un pedido. Sólo se permite cancelar
 * productos de pedidos en estado "pendiente".
 *
 * El servlet recibe parámetros de detalleId y pedidoId, verifica que el
 * pedido pertenezca al usuario logueado y el producto esté en estado activo.
 * Luego realiza la cancelación devolviendo el stock al inventario.
 *
 * Mapea la URL: /cancelar-detalle-pedido
 */
@WebServlet("/cancelar-detalle-pedido")
public class CancelarDetallePedidoServlet extends HttpServlet {

    /**
     * Método doPost
     * -----------------------------------------------------
     * Procesa la cancelación de un producto específico de un pedido
     * a través de una petición POST.
     *
     * Parámetros requeridos:
     * - detalleId (int): ID del detalle de pedido a cancelar.
     * - pedidoId (int): ID del pedido al que pertenece el detalle.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Configurar la respuesta como JSON
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        // Registro de depuración: mostrar todos los parámetros recibidos
        System.out.println("==== PARÁMETROS RECIBIDOS EN CANCELAR-DETALLE-PEDIDO ====");
        java.util.Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            System.out.println(paramName + ": " + request.getParameter(paramName));
        }

        try {
            // Verificar que el usuario tiene sesión activa
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("usuarioId") == null) {
                // Usuario no autenticado
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                out.print("{\"success\": false, \"error\": \"Usuario no autenticado\"}");
                out.flush();
                return;
            }

            // Recuperar ID de usuario desde sesión
            int usuarioId = (int) session.getAttribute("usuarioId");
            System.out.println("Usuario ID de sesión: " + usuarioId);

            // Obtener IDs desde los parámetros de la solicitud
            String detalleIdParam = request.getParameter("detalleId");
            String pedidoIdParam = request.getParameter("pedidoId");

            // Verificar que los parámetros no son nulos
            if (detalleIdParam == null || pedidoIdParam == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400
                out.print("{\"success\": false, \"error\": \"Faltan parámetros requeridos: detalleId o pedidoId\"}");
                out.flush();
                return;
            }

            int detalleId, pedidoId;

            try {
                detalleId = Integer.parseInt(detalleIdParam);
                pedidoId = Integer.parseInt(pedidoIdParam);
                System.out.println("Parámetros parseados: detalleId=" + detalleId + ", pedidoId=" + pedidoId);
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400
                out.print("{\"success\": false, \"error\": \"Los parámetros deben ser numéricos\"}");
                out.flush();
                return;
            }

            // Invocar al DAO para intentar cancelar el detalle del pedido
            PedidoDetalleDAO dao = new PedidoDetalleDAO();
            boolean exito = dao.cancelarDetallePedido(detalleId, pedidoId, usuarioId);

            System.out.println("Resultado de la cancelación: " + (exito ? "ÉXITO" : "FALLO"));

            // Devolver respuesta en formato JSON
            if (exito) {
                out.print("{\"success\": true, \"message\": \"Producto cancelado correctamente\"}");
            } else {
                out.print(
                        "{\"success\": false, \"error\": \"No se pudo cancelar el producto. Verifica que el pedido esté pendiente y el producto activo.\"}");
            }
            out.flush();

        } catch (Exception e) {
            // Registrar la excepción completa
            System.err.println("Error en CancelarDetallePedidoServlet: " + e.getMessage());
            e.printStackTrace();

            // Enviar respuesta de error
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500
            out.print("{\"success\": false, \"error\": \"Error interno del servidor: " + e.getMessage() + "\"}");
            out.flush();
        }
    }
}