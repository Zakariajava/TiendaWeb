package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
// Ya no necesitamos estos imports porque usamos la clase HashUtils
// import java.security.MessageDigest;
// import java.security.NoSuchAlgorithmException;
// import java.nio.charset.StandardCharsets;

/**
 * Servlet RegisterServlet
 * -------------------------------------------------------------
 * Este servlet se encarga del registro de nuevos usuarios.
 * Procesa los datos del formulario de registro, realiza validaciones,
 * verifica si el email ya existe, hashea la contraseña y guarda el usuario
 * en la base de datos. Luego redirige al login.
 *
 * URL de acceso: /registro-servlet
 */
@WebServlet("/registro-servlet")
public class RegisterServlet extends HttpServlet {

    /**
     * Maneja el envío del formulario de registro (método POST).
     *
     * @param request  Petición HTTP con los datos del formulario
     * @param response Respuesta HTTP a enviar al cliente
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession();

        // 1) Obtener parámetros del formulario
        String nombre = request.getParameter("regName");
        String apellidos = request.getParameter("regLastname");
        String domicilio = request.getParameter("regAddress");
        String ciudad = request.getParameter("regCity");
        String provincia = request.getParameter("regProvince");
        String cp = request.getParameter("regZip");
        String telefono = request.getParameter("regPhone");
        String email = request.getParameter("regEmail");
        String pass1 = request.getParameter("regPassword");
        String pass2 = request.getParameter("regPassword2");

        // 2) Validar campos obligatorios
        if (nombre == null || nombre.trim().isEmpty() ||
                apellidos == null || apellidos.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                pass1 == null || pass1.trim().isEmpty()) {

            session.setAttribute("errorReg", "Faltan campos obligatorios.");
            // Corregir la ruta de redirección
            response.sendRedirect(request.getContextPath() + "/html/registrar.jsp");
            return;
        }

        // 2.1) Validar coincidencia de contraseñas
        if (!pass1.equals(pass2)) {
            session.setAttribute("errorReg", "Las contraseñas no coinciden.");
            // Corregir la ruta de redirección
            response.sendRedirect(request.getContextPath() + "/html/registrar.jsp");
            return;
        }

        // 3) Verificar si el correo ya está registrado
        UsuarioDAO dao = new UsuarioDAO();
        if (dao.existeEmail(email)) {
            session.setAttribute("errorReg", "Ese email ya está registrado.");
            // Corregir la ruta de redirección
            response.sendRedirect(request.getContextPath() + "/html/registrar.jsp");
            return;
        }

        // 4) Crear objeto Usuario con los datos y contraseña hasheada
        Usuario nuevo = new Usuario();
        nuevo.setNombre(nombre);
        nuevo.setApellidos(apellidos);
        nuevo.setDomicilio(domicilio);
        nuevo.setPoblacion(ciudad);
        nuevo.setProvincia(provincia);
        nuevo.setCp(cp);
        nuevo.setTelefono(telefono);
        nuevo.setEmail(email);

        // Hashear la contraseña antes de almacenarla
        String hashed = hashPassword(pass1);
        nuevo.setClave(hashed);

        // 5) Insertar el nuevo usuario en la base de datos
        dao.registrarUsuario(nuevo);

        // Eliminar errores previos si los hubiera
        session.removeAttribute("errorReg");

        // 6) Redirigir al login tras registro exitoso
        response.sendRedirect(request.getContextPath() + "/html/login.jsp");
    }

    /**
     * Genera el hash SHA-256 de una cadena de texto (contraseña).
     * Utiliza la clase utilitaria HashUtils para centralizar la lógica.
     *
     * @param original Texto en claro a hashear
     * @return Cadena hasheada en hexadecimal
     */
    private String hashPassword(String original) {
        try {
            return HashUtils.hash(original);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}