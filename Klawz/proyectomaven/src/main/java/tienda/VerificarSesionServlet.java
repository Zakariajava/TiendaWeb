package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

/**
 * Servlet VerificarSesionServlet
 * -------------------------------------------------------------
 * Este servlet tiene como finalidad comprobar si existe una sesión activa
 * de usuario. Se utiliza principalmente mediante peticiones AJAX para
 * validar si el usuario ha iniciado sesión en el sistema sin necesidad
 * de recargar la página.
 *
 * URL asociada: /verificar-sesion
 */
@WebServlet("/verificar-sesion")
public class VerificarSesionServlet extends HttpServlet {

    /**
     * Método doGet
     * -------------------------------------------------------------
     * Este método responde a peticiones GET realizadas al servlet.
     * Comprueba si existe una sesión activa y si contiene el atributo
     * "usuarioId", que representa que un usuario ha iniciado sesión.
     *
     * - Si la sesión existe y el usuario está logueado, se devuelve
     * el estado HTTP 200 (OK).
     * - Si no hay sesión o no está logueado, se devuelve
     * el estado HTTP 401 (Unauthorized).
     *
     * @param request  Objeto HttpServletRequest con la información de la solicitud
     * @param response Objeto HttpServletResponse con la respuesta HTTP al cliente
     * @throws ServletException Si ocurre un error en el servlet
     * @throws IOException      Si ocurre un error de entrada/salida
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Obtener la sesión sin crear una nueva si no existe
        HttpSession session = request.getSession(false);

        // Si existe sesión y contiene el atributo "usuarioId", el usuario está logueado
        if (session != null && session.getAttribute("usuarioId") != null) {
            response.setStatus(HttpServletResponse.SC_OK); // 200 - Usuario autenticado
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 - Usuario no autenticado
        }
    }
}
