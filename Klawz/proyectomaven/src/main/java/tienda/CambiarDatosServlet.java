package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

/**
 * CambiarDatosServlet.java (Actualizado)
 * ----------------------------------------------------------------
 * Este servlet forma parte del controlador en el patrón MVC. Se encarga
 * exclusivamente de validar los datos recibidos desde el formulario
 * "cambiardatos.jsp" y delega la actualización en la base de datos
 * al DAO correspondiente (UsuarioDAO).
 * 
 * Realiza las siguientes funciones:
 * - Verifica que el usuario tenga sesión iniciada.
 * - Recupera y valida los campos del formulario.
 * - Comprueba si el usuario desea cambiar su contraseña.
 * - Llama al DAO para actualizar los datos personales (y contraseña si aplica).
 * 
 * Actualización: Ahora soporta diferentes tipos de acciones a través del
 * parámetro "accion", permitiendo separar la lógica de actualizar datos
 * personales de la de cambiar la contraseña.
 * 
 * No contiene ningún acceso directo a base de datos.
 */

@WebServlet("/cambiardatos-servlet")
public class CambiarDatosServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Verificar sesión iniciada
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.sendRedirect(request.getContextPath() + "/html/login.jsp");
            return;
        }

        // 2. Obtener el ID del usuario y determinar qué acción realizar
        int userId = (Integer) session.getAttribute("usuarioId");
        String accion = request.getParameter("accion");

        if (accion == null) {
            accion = "datosPersonales"; // Acción por defecto para compatibilidad
        }

        switch (accion) {
            case "datosPersonales":
                procesarDatosPersonales(request, response, session, userId);
                break;
            case "cambiarPassword":
                procesarCambioPassword(request, response, session, userId);
                break;
            default:
                session.setAttribute("errorCambio", "❌ Acción no válida.");
                response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp");
        }
    }

    /**
     * Procesa el formulario de datos personales
     */
    private void procesarDatosPersonales(HttpServletRequest request, HttpServletResponse response,
            HttpSession session, int userId)
            throws ServletException, IOException {

        // Recuperar campos del formulario
        String nombre = request.getParameter("editName");
        String apellidos = request.getParameter("editLastname");
        String domicilio = request.getParameter("editAddress");
        String ciudad = request.getParameter("editCity");
        String provincia = request.getParameter("editProvince");
        String cp = request.getParameter("editZip");
        String telefono = request.getParameter("editPhone");
        String email = request.getParameter("editEmail");

        // Validar campos obligatorios
        if (nombre.isEmpty() || apellidos.isEmpty() || domicilio.isEmpty() || ciudad.isEmpty()
                || provincia.isEmpty() || cp.isEmpty() || telefono.isEmpty() || email.isEmpty()) {
            session.setAttribute("errorCambio", "❌ Todos los campos personales son obligatorios.");
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=perfil");
            return;
        }

        // Actualizar datos personales
        try {
            UsuarioDAO dao = new UsuarioDAO();

            Usuario u = new Usuario();
            u.setId(userId);
            u.setNombre(nombre);
            u.setApellidos(apellidos);
            u.setDomicilio(domicilio);
            u.setPoblacion(ciudad);
            u.setProvincia(provincia);
            u.setCp(cp);
            u.setTelefono(telefono);
            u.setEmail(email);

            dao.actualizarDatosYClave(u, null); // clave = null (no cambiar)

            // Establecer mensaje de éxito
            session.setAttribute("exitoCambio", "✅ Datos personales actualizados correctamente.");
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=perfil");
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorCambio", "❌ Error al actualizar datos: " + e.getMessage());
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=perfil");
        }
    }

    /**
     * Procesa el formulario de cambio de contraseña
     */
    private void procesarCambioPassword(HttpServletRequest request, HttpServletResponse response,
            HttpSession session, int userId)
            throws ServletException, IOException {

        // Recuperar campos de contraseña
        String actualClave = request.getParameter("editPasswordActual");
        String nuevaClave1 = request.getParameter("editPasswordNueva1");
        String nuevaClave2 = request.getParameter("editPasswordNueva2");

        // Validar que todos los campos están completos
        if (actualClave.isEmpty() || nuevaClave1.isEmpty() || nuevaClave2.isEmpty()) {
            session.setAttribute("errorCambio", "❌ Todos los campos de contraseña son obligatorios.");
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=seguridad");
            return;
        }

        // Validar coincidencia de nuevas claves
        if (!nuevaClave1.equals(nuevaClave2)) {
            session.setAttribute("errorCambio", "❌ Las nuevas contraseñas no coinciden.");
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=seguridad");
            return;
        }

        try {
            UsuarioDAO dao = new UsuarioDAO();

            // Verificar que la contraseña actual sea correcta
            String hashBD = dao.obtenerHashActual(userId);
            String hashInput = HashUtils.hash(actualClave);
            if (!hashBD.equals(hashInput)) {
                session.setAttribute("errorCambio", "❌ La contraseña actual no es correcta.");
                // Redirigir a la misma pestaña
                response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=seguridad");
                return;
            }

            // Evitar repetir la misma clave anterior
            String hashNueva = HashUtils.hash(nuevaClave1);
            if (hashNueva.equals(hashBD)) {
                session.setAttribute("errorCambio", "❌ La nueva contraseña no puede ser igual a la anterior.");
                // Redirigir a la misma pestaña
                response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=seguridad");
                return;
            }

            // Actualizar solo la contraseña
            Usuario u = new Usuario();
            u.setId(userId);
            u.setClave(hashNueva);

            dao.actualizarSoloPassword(u, hashNueva);

            // Establecer mensaje de éxito
            session.setAttribute("exitoCambio", "✅ Contraseña actualizada correctamente.");
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=seguridad");
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorCambio", "❌ Error al cambiar contraseña: " + e.getMessage());
            // Redirigir a la misma pestaña
            response.sendRedirect(request.getContextPath() + "/html/cambiardatos.jsp?tab=seguridad");
        }
    }
}