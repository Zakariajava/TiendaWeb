package tienda;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.jsp.JspException;
import jakarta.servlet.jsp.JspWriter;
import jakarta.servlet.jsp.tagext.SimpleTagSupport;
import java.io.IOException;

/**
 * I18nTagHandler
 * ---------------------------------------------------------
 * Esta clase es un manejador de etiquetas JSP personalizado para la
 * internacionalización. Permite usar etiquetas <i18n:message> en JSP
 * para mostrar mensajes traducidos según el idioma actual.
 */
public class I18nTagHandler extends SimpleTagSupport {

    /** Clave del mensaje a traducir */
    private String key;

    /**
     * Establece la clave del mensaje.
     * 
     * @param key Clave del mensaje en el archivo de recursos
     */
    public void setKey(String key) {
        this.key = key;
    }

    /**
     * Método que se ejecuta cuando se encuentra la etiqueta en la página JSP.
     * Obtiene el mensaje traducido y lo escribe en la salida.
     */
    @Override
    public void doTag() throws JspException, IOException {
        // Obtener el objeto HttpServletRequest para poder acceder a la sesión
        HttpServletRequest request = (HttpServletRequest) ((jakarta.servlet.jsp.PageContext) getJspContext())
                .getRequest();

        // Obtener el mensaje traducido
        String message = LanguageUtil.getMessage(request, key);

        // Escribir el mensaje en la salida
        JspWriter out = getJspContext().getOut();
        out.print(message);
    }
}