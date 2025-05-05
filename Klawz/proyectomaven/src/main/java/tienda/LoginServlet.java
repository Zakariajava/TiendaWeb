package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

/**
 * Servlet LoginServlet
 * ------------------------------------------------------------
 * Este servlet gestiona el proceso de inicio de sesión de usuarios.
 * Valida las credenciales introducidas por el usuario, verifica que
 * la cuenta esté activa y, si todo es correcto, crea una sesión
 * con los datos necesarios para que el usuario navegue autenticado.
 * 
 * Además, redirige al usuario a diferentes páginas según el origen:
 * - Si viene del checkout, lo envía a carrito.jsp
 * - Si viene del menú normal, lo envía a usuario.jsp
 */
@WebServlet("/login-servlet")
public class LoginServlet extends HttpServlet {

    /**
     * Método doPost
     * ------------------------------------------------------------
     * Procesa la solicitud POST enviada desde el formulario de login.
     * Obtiene los parámetros de email y contraseña, los valida frente
     * a la base de datos, y crea una sesión si el login es correcto.
     *
     * @param request  objeto que contiene la petición del cliente
     * @param response objeto que se utiliza para generar la respuesta
     * @throws ServletException en caso de error del servlet
     * @throws IOException      en caso de error de entrada/salida
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Recuperar parámetros del formulario
        String email = request.getParameter("username");
        String password = request.getParameter("password");

        // Recuperar el parámetro "from" para saber de dónde viene el usuario
        String from = request.getParameter("from");

        // Generar hash de la contraseña ingresada
        String hashedPassword;
        try {
            hashedPassword = HashUtils.hash(password);
        } catch (Exception e) {
            throw new ServletException("Error al generar el hash de la contraseña", e);
        }

        // Buscar el usuario por email
        UsuarioDAO dao = new UsuarioDAO();
        Usuario user = dao.buscarPorEmail(email);

        // Obtener la sesión actual o crear una nueva
        HttpSession session = request.getSession();

        // Validación de credenciales
        if (user == null || !user.getClave().equals(hashedPassword)) {
            session.setAttribute("error", "Usuario o contraseña incorrectos.");
            response.sendRedirect(request.getContextPath() + "/html/login.jsp");
            return;
        }

        // Verificación de cuenta activa
        if (!user.isActivo()) {
            session.setAttribute("error", "Tu cuenta está desactivada. Contacta con soporte.");
            response.sendRedirect(request.getContextPath() + "/html/login.jsp");
            return;
        }

        // Inicio de sesión exitoso: establecer variables de sesión
        session.removeAttribute("error");
        session.setAttribute("usuarioId", user.getId());
        session.setAttribute("usuarioEmail", user.getEmail());
        session.setAttribute("usuarioNombre", user.getNombre());
        session.setAttribute("usuarioApellidos", user.getApellidos());
        // Agregar datos de dirección a la sesión
        session.setAttribute("usuarioDomicilio", user.getDomicilio());
        session.setAttribute("usuarioCp", user.getCp());
        session.setAttribute("usuarioPoblacion", user.getPoblacion());
        session.setAttribute("usuarioProvincia", user.getProvincia());
        session.setAttribute("usuarioTelefono", user.getTelefono());

        // Decidir a dónde redirigir según el origen
        if ("carrito".equals(from)) {
            // Si viene desde el proceso de checkout, redirigir al carrito
            response.sendRedirect(request.getContextPath() + "/html/carrito.jsp");
        } else {
            // En cualquier otro caso (login normal desde el menú), redirigir al área de
            // usuario
            response.sendRedirect(request.getContextPath() + "/html/usuario.jsp");
        }
    }
}