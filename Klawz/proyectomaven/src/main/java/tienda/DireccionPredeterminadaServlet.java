package tienda;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.BufferedReader;

/**
 * Servlet DireccionPredeterminadaServlet
 * ------------------------------------------------------------------
 * Gestiona las operaciones relacionadas con las direcciones predeterminadas de
 * envío de los usuarios. Permite obtener, guardar y actualizar direcciones
 * predeterminadas.
 * 
 * Mejoras:
 * - Añadida funcionalidad para guardar dirección desde checkout
 * - Mensajes de respuesta internacionalizados
 * - Mejor manejo de errores y logging
 * - Mantiene al usuario en la pestaña de dirección al actualizar
 */
@WebServlet("/direccion-predeterminada-servlet")
public class DireccionPredeterminadaServlet extends HttpServlet {

    /**
     * Método GET para obtener la dirección predeterminada
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Verificar que el usuario esté logueado
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        int usuarioId = (int) session.getAttribute("usuarioId");
        System.out.println("Obteniendo dirección predeterminada para usuario: " + usuarioId);

        // Obtener la dirección predeterminada
        DireccionPredeterminadaDAO dao = new DireccionPredeterminadaDAO();
        DireccionPredeterminada direccion = dao.obtenerPorUsuarioId(usuarioId);

        // Preparar la respuesta JSON
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (direccion != null) {
            // Devolver la dirección encontrada
            out.print(new Gson().toJson(direccion));
            System.out.println("Dirección encontrada y enviada al cliente");
        } else {
            // Devolver un objeto vacío
            out.print("{}");
            System.out.println("No se encontró dirección predeterminada para el usuario");
        }

        out.flush();
    }

    /**
     * Método POST para guardar o actualizar la dirección predeterminada
     * Soporta dos modos:
     * 1. Desde la página de cuenta (formulario normal)
     * 2. Desde el checkout (formato JSON)
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("DireccionPredeterminadaServlet: doPost llamado");

        // Verificar que el usuario esté logueado
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            System.out.println("Usuario no autenticado");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("success", false);
            errorJson.addProperty("error", "No estás logueado");
            response.setContentType("application/json");
            response.getWriter().write(errorJson.toString());
            return;
        }

        int usuarioId = (int) session.getAttribute("usuarioId");
        String accion = request.getParameter("accion");
        String contentType = request.getContentType();

        System.out.println("Usuario ID: " + usuarioId);
        System.out.println("Acción: " + accion);
        System.out.println("Content-Type: " + contentType);

        // Verificar si es una petición JSON (desde checkout) o un formulario normal
        if (contentType != null && contentType.contains("application/json")) {
            // Procesar JSON (petición desde checkout)
            handleJsonRequest(request, response, usuarioId);
        } else {
            // Procesar formulario normal (desde la página de cuenta)
            handleFormRequest(request, response, session, usuarioId, accion);
        }
    }

    /**
     * Maneja las peticiones en formato JSON (normalmente desde el checkout)
     */
    private void handleJsonRequest(HttpServletRequest request, HttpServletResponse response, int usuarioId)
            throws IOException {

        StringBuilder jsonBuilder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
        }

        System.out.println("JSON recibido: " + jsonBuilder.toString());

        Gson gson = new Gson();
        JsonObject jsonData = gson.fromJson(jsonBuilder.toString(), JsonObject.class);

        // Extraer datos de la dirección
        String domicilio = jsonData.get("domicilio").getAsString();
        String poblacion = jsonData.get("poblacion").getAsString();
        String provincia = jsonData.get("provincia").getAsString();
        String cp = jsonData.get("cp").getAsString();
        String telefono = jsonData.get("telefono").getAsString();
        boolean guardarComoPredeterminada = jsonData.has("guardarComoPredeterminada")
                ? jsonData.get("guardarComoPredeterminada").getAsBoolean()
                : false;

        System.out.println("Guardar como predeterminada: " + guardarComoPredeterminada);

        // Si se debe guardar como predeterminada, actualizar en BD
        boolean resultado = false;
        if (guardarComoPredeterminada) {
            DireccionPredeterminada direccion = new DireccionPredeterminada(
                    usuarioId, domicilio, poblacion, provincia, cp, telefono);

            DireccionPredeterminadaDAO dao = new DireccionPredeterminadaDAO();
            resultado = dao.guardarOActualizar(direccion);

            System.out.println("Resultado de guardar dirección: " + resultado);
        } else {
            // Si no se guarda como predeterminada, considerar exitoso
            resultado = true;
        }

        // Responder con JSON
        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("success", resultado);
        if (resultado) {
            respuesta.addProperty("message",
                    guardarComoPredeterminada ? "Dirección guardada como predeterminada"
                            : "Dirección utilizada solo para este pedido");
        } else {
            respuesta.addProperty("error", "Error al guardar la dirección predeterminada");
        }

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(respuesta.toString());
        out.flush();
    }

    /**
     * Maneja las peticiones de formulario normal (desde la página de cuenta)
     */
    private void handleFormRequest(HttpServletRequest request, HttpServletResponse response,
            HttpSession session, int usuarioId, String accion) throws IOException, ServletException {

        if ("guardarDireccion".equals(accion)) {
            String domicilio = request.getParameter("defaultAddress");
            String poblacion = request.getParameter("defaultCity");
            String provincia = request.getParameter("defaultProvince");
            String cp = request.getParameter("defaultZip");
            String telefono = request.getParameter("defaultPhone");

            System.out.println("Datos recibidos - Domicilio: " + domicilio);

            // Validación
            if (domicilio == null || domicilio.isEmpty() ||
                    poblacion == null || poblacion.isEmpty() ||
                    provincia == null || provincia.isEmpty() ||
                    cp == null || cp.isEmpty() ||
                    telefono == null || telefono.isEmpty()) {

                System.out.println("Validación fallida: campos vacíos");
                session.setAttribute("errorCambio", "❌ " +
                        LanguageUtil.getMessage(request, "error.required"));
                // Redirigir manteniendo la pestaña activa
                response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=direccion");
                return;
            }

            try {
                // Crear objeto y guardar
                DireccionPredeterminada direccion = new DireccionPredeterminada(
                        usuarioId, domicilio, poblacion, provincia, cp, telefono);

                DireccionPredeterminadaDAO dao = new DireccionPredeterminadaDAO();
                boolean resultado = dao.guardarOActualizar(direccion);

                if (resultado) {
                    System.out.println("Dirección guardada correctamente");
                    session.setAttribute("exitoCambio", "✅ " +
                            LanguageUtil.getMessage(request, "profile.addressSaved"));
                } else {
                    System.out.println("Error al guardar dirección");
                    session.setAttribute("errorCambio", "❌ " +
                            LanguageUtil.getMessage(request, "error.generalError"));
                }

                // Redirigir manteniendo la pestaña activa
                System.out.println(
                        "Redirigiendo a: " + request.getContextPath() + "/html/cambiardatos.jsp?tab=direccion");
                response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=direccion");

            } catch (Exception e) {
                System.out.println("Excepción: " + e.getMessage());
                e.printStackTrace();
                session.setAttribute("errorCambio", "❌ " +
                        LanguageUtil.getMessage(request, "error.generalError") + ": " + e.getMessage());
                // Redirigir manteniendo la pestaña activa
                response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=direccion");
            }
        } else {
            System.out.println("Acción desconocida o no especificada");
            // Si no hay acción específica, redirigir a cambiardatos.jsp con la pestaña de
            // dirección activa
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=direccion");
        }
    }
}