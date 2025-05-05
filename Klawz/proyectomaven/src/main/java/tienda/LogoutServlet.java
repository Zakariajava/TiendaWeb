package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

/**
 * Servlet LogoutServlet
 * ------------------------------------------------------------
 * Este servlet se encarga de cerrar la sesión activa del usuario.
 * Cuando se accede a él mediante una petición GET, invalida la sesión
 * actual (si existe) y redirige al usuario a la página de login.
 * 
 * Actualización: Ahora redirige a login.jsp en lugar de a index.jsp.
 */
@WebServlet("/logout-servlet")
public class LogoutServlet extends HttpServlet {

    /**
     * Método doGet
     * ------------------------------------------------------------
     * Se ejecuta cuando el usuario accede a /logout-servlet.
     * Elimina la sesión existente para cerrar la sesión del usuario
     * y redirige a la página de login del sitio (login.jsp).
     *
     * @param request  Petición HTTP del cliente
     * @param response Respuesta HTTP hacia el cliente
     * @throws ServletException si ocurre un error interno del servlet
     * @throws IOException      si ocurre un error de entrada/salida
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Obtener la sesión actual sin crear una nueva si no existe
        HttpSession session = request.getSession(false);

        // Si hay una sesión activa, invalidarla
        if (session != null) {
            session.invalidate();
        }

        // Redirigir al usuario a la página de login
        response.sendRedirect(request.getContextPath() + "/html/login.jsp");
    }
}