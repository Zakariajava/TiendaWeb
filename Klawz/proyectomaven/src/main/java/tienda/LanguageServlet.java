package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

/**
 * Servlet LanguageServlet
 * ---------------------------------------------------------
 * Este servlet gestiona el cambio de idioma de la aplicación.
 * Recibe un parámetro 'lang' con el código del idioma deseado,
 * actualiza la sesión y redirige a la página anterior.
 * 
 * URL: /cambiar-idioma
 */
@WebServlet("/cambiar-idioma")
public class LanguageServlet extends HttpServlet {

    /**
     * Procesa las peticiones GET para cambiar el idioma.
     * Recibe el parámetro 'lang' y el parámetro opcional 'redirect' para
     * especificar dónde redirigir después del cambio.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Obtener el idioma de los parámetros
        String lang = request.getParameter("lang");
        if (lang == null || lang.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Parámetro 'lang' requerido");
            return;
        }

        // Establecer el idioma en la sesión
        boolean changed = LanguageUtil.setLanguage(request, lang);
        if (!changed) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Idioma no soportado");
            return;
        }

        // Determinar a dónde redirigir
        String redirect = request.getParameter("redirect");
        if (redirect == null || redirect.isEmpty()) {
            // Si no hay redirección específica, volver a la página de referencia
            String referer = request.getHeader("Referer");
            if (referer != null && !referer.isEmpty()) {
                response.sendRedirect(referer);
            } else {
                // Si no hay referer, redirigir a la página principal
                response.sendRedirect(request.getContextPath() + "/html/index.jsp");
            }
        } else {
            // Redirigir a la página especificada
            response.sendRedirect(request.getContextPath() + redirect);
        }
    }
}