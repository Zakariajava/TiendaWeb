package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.BufferedReader;

/**
 * Servlet ActualizarDireccionServlet
 * --------------------------------------------------------------
 * Este servlet gestiona la actualización de la dirección de envío
 * durante el proceso de compra. Permite modificar la dirección
 * después de haber creado el pedido pero antes de confirmarlo.
 * 
 * URL: /actualizar-direccion
 */
@WebServlet("/actualizar-direccion")
public class ActualizarDireccionServlet extends HttpServlet {

    /**
     * Método POST
     * --------------------------------------------------------------
     * Recibe los datos de la dirección actualizada en formato JSON
     * y los actualiza en la base de datos para el pedido especificado.
     * 
     * @param request  Petición HTTP
     * @param response Respuesta HTTP
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Verificar que hay una sesión activa
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"error\": \"No estás logueado\"}");
            return;
        }

        int usuarioId = (int) session.getAttribute("usuarioId");

        // Leer los datos JSON de la petición
        StringBuilder jsonBuilder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
        }

        // Parsear el JSON
        Gson gson = new Gson();
        JsonObject datos;
        try {
            datos = gson.fromJson(jsonBuilder.toString(), JsonObject.class);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"error\": \"JSON mal formado\"}");
            return;
        }

        // Extraer datos
        int pedidoId;
        try {
            pedidoId = datos.get("pedidoId").getAsInt();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"error\": \"ID de pedido no válido\"}");
            return;
        }

        // Verificar que el pedido pertenece al usuario
        PedidoDAO pedidoDAO = new PedidoDAO();
        boolean esDelUsuario = pedidoDAO.verificarPedidoUsuario(pedidoId, usuarioId);
        if (!esDelUsuario) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter()
                    .write("{\"success\": false, \"error\": \"No tienes permiso para modificar este pedido\"}");
            return;
        }

        // Extraer datos de la dirección
        String domicilio = datos.get("domicilio").getAsString();
        String cp = datos.get("cp").getAsString();
        String poblacion = datos.get("poblacion").getAsString();
        String provincia = datos.get("provincia").getAsString();
        String telefono = datos.get("telefono").getAsString();

        // Validar datos
        if (domicilio.isEmpty() || cp.isEmpty() || poblacion.isEmpty() ||
                provincia.isEmpty() || telefono.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"error\": \"Todos los campos son obligatorios\"}");
            return;
        }

        // Crear objeto DireccionEnvio
        DireccionEnvio direccion = new DireccionEnvio(pedidoId, domicilio, poblacion, provincia, cp, telefono);

        // Actualizar en la base de datos
        DireccionEnvioDAO direccionDAO = new DireccionEnvioDAO();
        boolean actualizado = direccionDAO.actualizarDireccion(direccion);

        // Responder
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        if (actualizado) {
            out.write("{\"success\": true, \"message\": \"Dirección actualizada correctamente\"}");
        } else {
            out.write("{\"success\": false, \"error\": \"No se pudo actualizar la dirección\"}");
        }
        out.flush();
    }
}