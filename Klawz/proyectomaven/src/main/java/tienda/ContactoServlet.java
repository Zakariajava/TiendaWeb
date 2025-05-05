package tienda;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

/**
 * Servlet ContactoServlet
 * ---------------------------------------------------------
 * Este servlet procesa los mensajes enviados a través del
 * formulario de contacto y los almacena en la base de datos.
 * 
 * URL: /contacto-servlet
 */
@WebServlet("/contacto-servlet")
public class ContactoServlet extends HttpServlet {

    /**
     * Procesa peticiones POST desde el formulario de contacto.
     * Valida los datos recibidos, crea un objeto Mensaje y lo guarda en la BD.
     * 
     * @param request  Petición HTTP que contiene los datos del formulario
     * @param response Respuesta HTTP que redirigirá al usuario
     * @throws ServletException Si ocurre un error en el servlet
     * @throws IOException      Si ocurre un error de entrada/salida
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Obtener los parámetros del formulario
        String nombre = request.getParameter("contactName");
        String email = request.getParameter("contactEmail");
        String contenido = request.getParameter("contactMessage");

        // Validar que los campos obligatorios no estén vacíos
        if (nombre == null || nombre.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                contenido == null || contenido.trim().isEmpty()) {

            // Establecer un mensaje de error y redirigir al formulario
            request.getSession().setAttribute("errorContacto",
                    LanguageUtil.getMessage(request, "error.required"));
            response.sendRedirect(request.getContextPath() + "/html/contact.jsp");
            return;
        }

        // Sanitizar los datos (eliminando etiquetas HTML)
        nombre = nombre.replaceAll("<.*?>", "");
        email = email.replaceAll("<.*?>", "");
        contenido = contenido.replaceAll("<.*?>", "");

        // Crear el objeto Mensaje
        Mensaje mensaje = new Mensaje(nombre, email, contenido);

        // Guardar el mensaje en la base de datos
        MensajeDAO mensajeDAO = new MensajeDAO();
        int resultadoId = mensajeDAO.guardarMensaje(mensaje);

        if (resultadoId > 0) {
            // Éxito: establecer un mensaje de confirmación
            request.getSession().setAttribute("exitoContacto",
                    LanguageUtil.getMessage(request, "success.message"));
        } else {
            // Error: establecer un mensaje de error
            request.getSession().setAttribute("errorContacto",
                    LanguageUtil.getMessage(request, "error.generalError"));
        }

        // Redirigir de vuelta al formulario de contacto
        response.sendRedirect(request.getContextPath() + "/html/contact.jsp");
    }
}