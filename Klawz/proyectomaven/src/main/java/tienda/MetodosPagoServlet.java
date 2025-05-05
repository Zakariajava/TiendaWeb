package tienda;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Servlet MetodosPagoServlet (Corregido)
 * --------------------------------------------------------------------
 * Este servlet gestiona las operaciones relacionadas con los métodos de pago
 * del usuario:
 * - GET: Recupera los métodos de pago favoritos del usuario o históricos
 * - POST: Actualiza un método de pago existente o guarda preferencia de método
 * de pago
 */
@WebServlet("/metodos-pago-servlet")
public class MetodosPagoServlet extends HttpServlet {

    /**
     * Método doGet
     * Obtiene los métodos de pago del usuario en sesión según el tipo solicitado.
     * Devuelve la lista en formato JSON.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Verificar que haya sesión activa
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // Obtener ID del usuario de la sesión
        int usuarioId = (int) session.getAttribute("usuarioId");

        // Lista combinada de métodos
        List<JsonObject> metodosUnificados = new ArrayList<>();

        // Verificar qué tipo de métodos se solicitan (favoritos, historial o ambos)
        String tipo = request.getParameter("tipo");
        System.out.println("Tipo de métodos solicitados: " + tipo);

        if (tipo == null || "todos".equals(tipo) || "favoritos".equals(tipo)) {
            // Consultar métodos favoritos
            MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
            List<MetodoPagoFavorito> metodosFavoritos = favoritosDAO.obtenerPorUsuario(usuarioId);

            System.out.println("Métodos favoritos encontrados: " + metodosFavoritos.size());

            // Convertir favoritos al formato de respuesta JSON consistente
            for (MetodoPagoFavorito favorito : metodosFavoritos) {
                JsonObject metodoJson = new JsonObject();
                metodoJson.addProperty("id", favorito.getId());
                metodoJson.addProperty("metodoPago", favorito.getMetodoPago());
                metodoJson.addProperty("numeroTarjetaHashed", favorito.getNumeroTarjetaHashed());
                metodoJson.addProperty("esFavorito", true);
                metodoJson.addProperty("predeterminado", favorito.isPredeterminado());

                metodosUnificados.add(metodoJson);
            }
        }

        if (tipo == null || "todos".equals(tipo) || "historial".equals(tipo)) {
            // Consultar métodos de pago históricos
            PagoDAO pagoDAO = new PagoDAO();
            List<Pago> metodosPago = pagoDAO.obtenerMetodosPagoUsuario(usuarioId);

            System.out.println("Métodos históricos encontrados: " + metodosPago.size());

            // Para evitar duplicados con los favoritos
            Set<String> metodosYaAgregados = new HashSet<>();

            // Recorrer métodos del historial y convertirlos al mismo formato JSON
            for (Pago pago : metodosPago) {
                // Crear clave única para este método
                String clave = pago.getMetodoPago();
                if (pago.getNumeroTarjetaHashed() != null) {
                    clave += "_" + pago.getNumeroTarjetaHashed();
                }

                // Solo agregar si no está ya en la lista
                if (!metodosYaAgregados.contains(clave)) {
                    JsonObject metodoJson = new JsonObject();
                    metodoJson.addProperty("id", pago.getId());
                    metodoJson.addProperty("metodoPago", pago.getMetodoPago());
                    metodoJson.addProperty("numeroTarjetaHashed", pago.getNumeroTarjetaHashed());
                    metodoJson.addProperty("esFavorito", false);
                    metodoJson.addProperty("predeterminado", false);

                    metodosUnificados.add(metodoJson);
                    metodosYaAgregados.add(clave);
                }
            }
        }

        // Devolver respuesta en formato JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        String jsonResponse = new Gson().toJson(metodosUnificados);
        System.out.println("Respuesta JSON: " + jsonResponse);
        out.print(jsonResponse);
        out.flush();
    }

    /**
     * Método doPost
     * Permite diversas operaciones con métodos de pago:
     * 1. Actualizar un método de pago existente
     * 2. Establecer un método como predeterminado
     * 3. Eliminar un método de pago
     * 4. Guardar una preferencia como nuevo método de pago
     * 
     * Los datos se reciben en formato JSON.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Verificar que haya sesión activa
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("success", false);
            errorJson.addProperty("error", "Usuario no autenticado");

            response.setContentType("application/json");
            PrintWriter out = response.getWriter();
            out.print(errorJson.toString());
            out.flush();
            return;
        }

        int usuarioId = (int) session.getAttribute("usuarioId");

        // Leer datos JSON
        StringBuilder jsonBuilder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
        }

        String jsonStr = jsonBuilder.toString();
        System.out.println("Datos recibidos: " + jsonStr);

        // Convertir JSON a objetos
        Gson gson = new Gson();
        JsonObject jsonData = gson.fromJson(jsonStr, JsonObject.class);

        // Preparar respuesta JSON
        JsonObject responseJson = new JsonObject();

        try {
            // Determinar tipo de operación
            String operacion = jsonData.has("operacion") ? jsonData.get("operacion").getAsString() : "actualizar";

            switch (operacion) {
                case "actualizar":
                    procesarActualizacion(jsonData, usuarioId, responseJson);
                    break;

                case "verificar":
                    procesarVerificacion(jsonData, usuarioId, responseJson);
                    break;

                case "guardar_preferencia":
                    procesarGuardarPreferencia(jsonData, usuarioId, responseJson);
                    break;

                case "establecer_predeterminado":
                    procesarEstablecerPredeterminado(jsonData, usuarioId, responseJson);
                    break;

                case "eliminar":
                    procesarEliminar(jsonData, usuarioId, responseJson);
                    break;

                default:
                    responseJson.addProperty("success", false);
                    responseJson.addProperty("error", "Operación no reconocida");
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("error", "Error al procesar la solicitud: " + e.getMessage());
        }

        // Enviar respuesta JSON
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(responseJson.toString());
        out.flush();
    }

    /**
     * Procesa una solicitud de actualización de método de pago
     */
    private void procesarActualizacion(JsonObject jsonData, int usuarioId, JsonObject responseJson) {
        try {
            // Extraer datos
            int pagoId = jsonData.get("pagoId").getAsInt();
            String metodoPago = jsonData.get("metodoPago").getAsString();

            // Verificar si hay nuevo número de tarjeta
            String numeroTarjeta = null;
            String numeroTarjetaHashed = null;

            if (jsonData.has("numeroTarjeta") && !jsonData.get("numeroTarjeta").isJsonNull()) {
                numeroTarjeta = jsonData.get("numeroTarjeta").getAsString();
                try {
                    numeroTarjetaHashed = HashUtils.hash(numeroTarjeta);
                    System.out.println("Número de tarjeta hasheado correctamente");
                } catch (Exception e) {
                    System.out.println("Error al hashear tarjeta: " + e.getMessage());
                    // Plan B: Usar últimos 4 dígitos como fallback
                    numeroTarjetaHashed = "****" + numeroTarjeta.substring(numeroTarjeta.length() - 4);
                }
            }

            // Actualizar el método de pago
            PagoDAO pagoDAO = new PagoDAO();
            boolean actualizado = pagoDAO.actualizarMetodoPago(pagoId, metodoPago, numeroTarjetaHashed, usuarioId);

            if (actualizado) {
                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "Método de pago actualizado correctamente");
            } else {
                responseJson.addProperty("success", false);
                responseJson.addProperty("error", "No se pudo actualizar el método de pago");
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("error", "Error en la actualización: " + e.getMessage());
        }
    }

    /**
     * Procesa una solicitud de verificación de método de pago
     */
    private void procesarVerificacion(JsonObject jsonData, int usuarioId, JsonObject responseJson) {
        try {
            // Extraer datos
            String metodoPago = jsonData.get("metodoPago").getAsString();

            // Obtener número de tarjeta hasheado si aplica
            String numeroTarjeta = null;
            String numeroTarjetaHashed = null;

            if (jsonData.has("numeroTarjeta") && !jsonData.get("numeroTarjeta").getAsString().isEmpty()) {
                numeroTarjeta = jsonData.get("numeroTarjeta").getAsString();
                try {
                    numeroTarjetaHashed = HashUtils.hash(numeroTarjeta);
                } catch (Exception e) {
                    throw new RuntimeException("Error al procesar el número de tarjeta", e);
                }
            }

            // Verificar si el método ya existe en favoritos
            MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
            boolean existe = favoritosDAO.existeMetodoSimilar(usuarioId, metodoPago, numeroTarjetaHashed);

            // Preparar respuesta
            responseJson.addProperty("success", true);
            responseJson.addProperty("exists", existe);

            // Si existe, buscar el ID del favorito existente
            if (existe && numeroTarjetaHashed != null) {
                List<MetodoPagoFavorito> metodos = favoritosDAO.obtenerPorUsuario(usuarioId);

                for (MetodoPagoFavorito metodo : metodos) {
                    if (metodoPago.equals(metodo.getMetodoPago()) &&
                            metodo.getNumeroTarjetaHashed() != null &&
                            metodo.getNumeroTarjetaHashed()
                                    .endsWith(numeroTarjetaHashed.substring(numeroTarjetaHashed.length() - 4))) {

                        responseJson.addProperty("pagoId", metodo.getId());
                        break;
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("error", "Error en la verificación: " + e.getMessage());
        }
    }

    /**
     * Procesa una solicitud de guardado de preferencia de método de pago
     * CORREGIDO: Mejor manejo del número de tarjeta y validación
     */
    private void procesarGuardarPreferencia(JsonObject jsonData, int usuarioId, JsonObject responseJson) {
        try {
            // Extraer datos directamente
            String metodoPago = jsonData.get("metodoPago").getAsString();
            System.out.println("Método de pago: " + metodoPago);

            // Variable para hash
            String numeroTarjetaHashed = null;

            // Manejar número de tarjeta solo para método "tarjeta"
            if ("tarjeta".equals(metodoPago)) {
                // Verificar si hay número de tarjeta
                if (jsonData.has("numeroTarjeta") && !jsonData.get("numeroTarjeta").isJsonNull() &&
                        !jsonData.get("numeroTarjeta").getAsString().isEmpty()) {

                    String numeroTarjeta = jsonData.get("numeroTarjeta").getAsString();
                    System.out.println("Número de tarjeta recibido: [OCULTO]");

                    try {
                        // SOLUCIÓN: Usar HashUtils para hashear el número de tarjeta
                        numeroTarjetaHashed = HashUtils.hash(numeroTarjeta);
                        System.out.println("Hash generado correctamente");
                    } catch (Exception e) {
                        System.out.println("Error al hashear: " + e.getMessage());
                        // Método alternativo si falla el hash: usar últimos 4 dígitos
                        numeroTarjetaHashed = "****" + numeroTarjeta.substring(numeroTarjeta.length() - 4);
                        System.out.println("Generado hash alternativo con últimos 4 dígitos");
                    }
                } else {
                    responseJson.addProperty("success", false);
                    responseJson.addProperty("error", "Falta número de tarjeta");
                    return;
                }
            }

            // Verificar predeterminado
            boolean predeterminado = jsonData.has("predeterminado") ? jsonData.get("predeterminado").getAsBoolean()
                    : false;

            // Verificar si ya existe un método similar
            MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
            boolean existe = favoritosDAO.existeMetodoSimilar(usuarioId, metodoPago, numeroTarjetaHashed);

            if (existe) {
                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "Método de pago ya disponible");
                return;
            }

            // Crear objeto simplificado
            MetodoPagoFavorito metodoPagoFav = new MetodoPagoFavorito();
            metodoPagoFav.setUsuarioId(usuarioId);
            metodoPagoFav.setMetodoPago(metodoPago);
            metodoPagoFav.setNumeroTarjetaHashed(numeroTarjetaHashed);
            metodoPagoFav.setPredeterminado(predeterminado);

            // Guardar directamente
            boolean guardado = favoritosDAO.guardar(metodoPagoFav);

            if (guardado) {
                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "Método guardado correctamente");
            } else {
                responseJson.addProperty("success", false);
                responseJson.addProperty("error", "Error al guardar en base de datos");
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("error", "Error: " + e.getMessage());
        }
    }

    /**
     * Procesa una solicitud para establecer un método como predeterminado
     */
    private void procesarEstablecerPredeterminado(JsonObject jsonData, int usuarioId, JsonObject responseJson) {
        try {
            // Extraer ID del método
            int id = jsonData.get("id").getAsInt();

            // Establecer como predeterminado
            MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
            boolean resultado = favoritosDAO.establecerPredeterminado(id, usuarioId);

            responseJson.addProperty("success", resultado);
            if (resultado) {
                responseJson.addProperty("message", "Método establecido como predeterminado");
            } else {
                responseJson.addProperty("error", "No se pudo establecer el método como predeterminado");
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("error", "Error al establecer método predeterminado: " + e.getMessage());
        }
    }

    /**
     * Procesa una solicitud de eliminación de método de pago
     */
    private void procesarEliminar(JsonObject jsonData, int usuarioId, JsonObject responseJson) {
        try {
            // Extraer ID del método
            int id = jsonData.get("id").getAsInt();

            // Eliminar método
            MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
            boolean resultado = favoritosDAO.eliminar(id, usuarioId);

            responseJson.addProperty("success", resultado);
            if (resultado) {
                responseJson.addProperty("message", "Método de pago eliminado correctamente");
            } else {
                responseJson.addProperty("error", "No se pudo eliminar el método de pago");
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("error", "Error al eliminar método de pago: " + e.getMessage());
        }
    }
}