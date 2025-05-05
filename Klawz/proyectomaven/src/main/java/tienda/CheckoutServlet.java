package tienda;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.ArrayList;

/**
 * Servlet CheckoutServlet (Mejorado)
 * ----------------------------------------------------------------------
 * Este servlet gestiona la formalización del pedido en la tienda online.
 * Se encarga de:
 * - Validar la sesión del usuario.
 * - Leer los datos del carrito, envío y pago desde el frontend (JSON).
 * - Registrar el pedido con sus detalles y actualizar el stock.
 * - Registrar la dirección de envío.
 * - Registrar el método de pago (ahora soporta métodos favoritos).
 */
@WebServlet("/checkout-servlet")
public class CheckoutServlet extends HttpServlet {

    /**
     * Procesa la solicitud POST enviada desde el formulario de checkout.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Validar que el usuario esté logueado
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuarioId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"error\": \"No estás logueado\"}");
            return;
        }

        int userId = (int) session.getAttribute("usuarioId");
        request.setCharacterEncoding("UTF-8");

        // Leer el cuerpo de la petición
        StringBuilder jsonBuilder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
        }

        String jsonBody = jsonBuilder.toString();
        System.out.println("Datos recibidos checkout: " + jsonBody);

        // Convertir JSON a objetos Java
        Gson gson = new Gson();
        JsonObject datos;
        try {
            datos = gson.fromJson(jsonBody, JsonObject.class);
        } catch (JsonSyntaxException ex) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"error\": \"JSON mal formado\"}");
            return;
        }

        try {
            Type listType = new TypeToken<List<CartItem>>() {
            }.getType();
            List<CartItem> cartItems = gson.fromJson(datos.get("carrito"), listType);

            if (cartItems == null || cartItems.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"empty\": true}");
                return;
            }

            // Obtener campos del formulario
            String domicilio = datos.get("domicilio").getAsString();
            String cp = datos.get("cp").getAsString();
            String poblacion = datos.get("poblacion").getAsString();
            String provincia = datos.get("provincia").getAsString();
            String telefono = datos.get("telefono").getAsString();
            String metodoPago = datos.get("metodoPago").getAsString();

            // Variables para el método de pago
            String numeroTarjeta = null;
            String numeroTarjetaHashed = null;
            boolean guardarMetodoPago = false;
            boolean metodoPredeterminado = false;
            int metodoPagoFavoritoId = -1;
            boolean esFavorito = false;

            // Procesar método de pago
            if (datos.has("metodoPagoFavoritoId") && !datos.get("metodoPagoFavoritoId").isJsonNull()) {
                // Si se usó un método favorito existente
                metodoPagoFavoritoId = datos.get("metodoPagoFavoritoId").getAsInt();
                esFavorito = datos.has("esFavorito") && datos.get("esFavorito").getAsBoolean();
                System.out.println("Usando método de pago favorito ID: " + metodoPagoFavoritoId);
            } else {
                // Si es un nuevo método
                if (datos.has("numeroTarjeta") && !datos.get("numeroTarjeta").isJsonNull() &&
                        !datos.get("numeroTarjeta").getAsString().isEmpty()) {
                    numeroTarjeta = datos.get("numeroTarjeta").getAsString();
                    try {
                        numeroTarjetaHashed = HashUtils.hash(numeroTarjeta);
                    } catch (Exception e) {
                        // Fallback si falla el hash - usar últimos 4 dígitos
                        numeroTarjetaHashed = "****" + numeroTarjeta.substring(numeroTarjeta.length() - 4);
                        System.out.println("Error al hashear tarjeta, usando últimos 4 dígitos: " + e.getMessage());
                    }
                } else if (metodoPago.equals("tarjeta")) {
                    // Si es tarjeta pero no hay número, devolver error
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("application/json");
                    response.getWriter()
                            .write("{\"success\": false, \"error\": \"El número de tarjeta es obligatorio\"}");
                    return;
                }

                // Verificar si guardar para futuro uso
                if (datos.has("guardarMetodoPago")) {
                    guardarMetodoPago = datos.get("guardarMetodoPago").getAsBoolean();
                    System.out.println("Guardar método de pago: " + guardarMetodoPago);

                    if (guardarMetodoPago && datos.has("metodoPredeterminado")) {
                        metodoPredeterminado = datos.get("metodoPredeterminado").getAsBoolean();
                        System.out.println("Como predeterminado: " + metodoPredeterminado);
                    }
                }
            }

            // Paso 1: Verificar stock actual
            ProductoDAO productoDAO = new ProductoDAO();
            Map<Integer, Integer> stockActual = productoDAO.obtenerStockDeProductos(cartItems);
            List<CartItem> carritoFiltrado = new ArrayList<>();

            for (CartItem item : cartItems) {
                int stock = stockActual.getOrDefault(item.getProductId(), 0);
                if (stock <= 0)
                    continue;
                if (item.getQuantity() > stock)
                    item.setQuantity(stock);
                carritoFiltrado.add(item);
            }

            if (carritoFiltrado.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"empty\": true}");
                return;
            }

            // Paso 2: Crear pedido y registrar detalles
            PedidoDAO pedidoDAO = new PedidoDAO();
            int pedidoId = pedidoDAO.crearPedidoConDetalles(userId, carritoFiltrado);

            if (pedidoId <= 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"error\": \"No se pudo crear el pedido\"}");
                return;
            }

            // Paso 3: Guardar dirección
            DireccionEnvio direccion = new DireccionEnvio(pedidoId, domicilio, poblacion, provincia, cp, telefono);
            DireccionEnvioDAO direccionDAO = new DireccionEnvioDAO();
            direccionDAO.insertarDireccion(direccion);

            // Paso 4: Procesar y guardar el método de pago
            Pago pago;

            if (esFavorito && metodoPagoFavoritoId > 0) {
                // Si se seleccionó un método favorito existente, obtenerlo
                MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
                MetodoPagoFavorito favorito = null;

                try {
                    favorito = favoritosDAO.obtenerPorId(metodoPagoFavoritoId);
                } catch (Exception e) {
                    System.out.println("Error al obtener método favorito: " + e.getMessage());
                }

                if (favorito != null) {
                    // Crear un pago usando los datos del favorito
                    pago = new Pago(pedidoId, favorito.getMetodoPago(), favorito.getNumeroTarjetaHashed());
                } else {
                    // Si no se encuentra, usar método genérico
                    pago = new Pago(pedidoId, metodoPago, numeroTarjetaHashed);
                }
            } else {
                // Crear un nuevo registro con los datos proporcionados
                pago = new Pago(pedidoId, metodoPago, numeroTarjetaHashed);
            }

            // Guardar el pago en la base de datos
            try {
                PagoDAO pagoDAO = new PagoDAO();
                pagoDAO.insertarPago(pago);

                // Si se quiere guardar el método para uso futuro y no es un favorito existente
                if (guardarMetodoPago && !esFavorito) {
                    try {
                        MetodosPagoFavoritosDAO favoritosDAO = new MetodosPagoFavoritosDAO();
                        MetodoPagoFavorito nuevoFavorito = new MetodoPagoFavorito();
                        nuevoFavorito.setUsuarioId(userId);
                        nuevoFavorito.setMetodoPago(metodoPago);
                        nuevoFavorito.setNumeroTarjetaHashed(numeroTarjetaHashed);
                        nuevoFavorito.setPredeterminado(metodoPredeterminado);

                        // ARREGLO: Verificar para tarjeta si hay número hasheado
                        if (metodoPago.equals("tarjeta")
                                && (numeroTarjetaHashed == null || numeroTarjetaHashed.isEmpty())) {
                            System.out.println(
                                    "No se guarda en favoritos: falta número de tarjeta hash para método tipo tarjeta");
                        } else {
                            boolean guardadoExitoso = favoritosDAO.guardar(nuevoFavorito);
                            System.out.println("Método de pago guardado para uso futuro: " + guardadoExitoso);
                        }
                    } catch (Exception e) {
                        System.out.println("Error al guardar método en favoritos: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            } catch (Exception e) {
                System.out.println("Error al guardar método de pago: " + e.getMessage());
                // No es crítico, continuar con el proceso
            }

            // Paso 5: Respuesta exitosa
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("success", true);
            respuesta.addProperty("pedidoId", pedidoId);

            // Log para debug
            System.out.println("Pedido creado exitosamente con ID: " + pedidoId);
            System.out.println("Enviando respuesta JSON: " + respuesta.toString());

            PrintWriter out = response.getWriter();
            out.write(respuesta.toString());
            out.flush();

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error durante procesamiento de pedido: " + e.getMessage());

            response.setStatus(HttpServletResponse.SC_OK); // Cambiado a 200 para asegurar que llegue la respuesta
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("success", false);
            errorJson.addProperty("error", "Error interno del servidor: " + e.getMessage());

            PrintWriter out = response.getWriter();
            out.write(errorJson.toString());
            out.flush();
        }
    }
}