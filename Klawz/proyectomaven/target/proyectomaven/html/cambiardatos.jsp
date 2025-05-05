<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <!--
    Configuración básica de la cabecera HTML:
    - Inclusión de Bootstrap para el estilo general.
    - Iconos con FontAwesome.
    - Icono de pestaña personalizado (favicon).
    - Enlace al CSS principal del proyecto.
  -->
  <meta charset="UTF-8">
  <title><i18n:message key="account.changePassword" /></title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/x-icon" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
  <style>
    @media (max-width: 767px) {
      .nav-tabs {
        flex-wrap: wrap;
      }
      .nav-tabs .nav-item {
        margin-bottom: 5px;
      }
    }
    
    @media (min-width: 768px) {
      .nav-tabs {
        display: flex;
        flex-wrap: nowrap;
      }
    }
    
    .payment-method-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .payment-method-card:hover {
      background-color: #f8f9fa;
      border-color: #adb5bd;
    }
    
    .payment-method-card.selected {
      border-color: #007bff;
      background-color: #f0f7ff;
      box-shadow: 0 0 0 1px #007bff;
    }
    
    .payment-method-new {
      border-style: dashed;
      background-color: #f8f9fa;
    }
  </style>
</head>

<body>
  <!--
    NAVBAR común en toda la aplicación:
    - Barra de navegación responsive fija en la parte superior.
    - Usa JSTL para mostrar "Mi Cuenta" si el usuario está logueado.
  -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="user"/>
  </jsp:include>
  <!--
    Sección principal del contenido de la página:
    - Formulario centrado para modificar datos del usuario.
    - Contiene validaciones de campos requeridos y muestra errores si los hay.
  -->
  <main class="container d-flex align-items-center justify-content-center full-height-container">
    <div class="col-md-8 mt-5 pt-5">
      <h3 class="text-center mb-4 mt-5"><i18n:message key="account.title" /></h3>

      <!-- Mostrar mensajes de error en caso de fallo de validación o actualización -->
      <c:if test="${not empty sessionScope.errorCambio}">
        <div class="alert alert-danger text-center">
          ${sessionScope.errorCambio}
        </div>
        <c:remove var="errorCambio" scope="session" />
      </c:if>
      
      <!-- Mostrar mensajes de éxito -->
      <c:if test="${not empty sessionScope.exitoCambio}">
        <div class="alert alert-success text-center">
          ${sessionScope.exitoCambio}
        </div>
        <c:remove var="exitoCambio" scope="session" />
      </c:if>

      <!-- Elemento para mostrar notificaciones dinamicas -->
      <div id="notification-container"></div>
      
      <!-- Pestañas para organizar los formularios -->
      <ul class="nav nav-tabs mb-4" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="perfil-tab" data-toggle="tab" href="#perfil" role="tab" 
             aria-controls="perfil" aria-selected="true">
            <i class="fas fa-user-circle"></i> <i18n:message key="account.personalData" />
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="pagos-tab" data-toggle="tab" href="#pagos" role="tab" 
             aria-controls="pagos" aria-selected="false">
            <i class="fas fa-credit-card"></i> <i18n:message key="account.paymentMethods" />
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="seguridad-tab" data-toggle="tab" href="#seguridad" role="tab" 
             aria-controls="seguridad" aria-selected="false">
            <i class="fas fa-lock"></i> <i18n:message key="account.changePassword" />
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="direccion-tab" data-toggle="tab" href="#direccion" role="tab" 
             aria-controls="direccion" aria-selected="false">
            <i class="fas fa-map-marker-alt"></i> <i18n:message key="account.shippingAddress" />
          </a>
        </li>
      </ul>
      
      <!-- Contenido de las pestañas -->
      <div class="tab-content" id="myTabContent">
        <!-- Pestaña 1: Datos personales -->
        <div class="tab-pane fade show active" id="perfil" role="tabpanel" aria-labelledby="perfil-tab">
          <form action="<%= request.getContextPath() %>/cambiardatos-servlet" method="post">
            <input type="hidden" name="accion" value="datosPersonales">
            
            <!-- Datos personales del usuario -->
            <div class="form-group mb-3">
              <label for="editName"><i18n:message key="checkout.name" /></label>
              <input type="text" id="editName" name="editName" class="form-control"
                     value="${sessionScope.usuarioNombre}" readonly>
            </div>
            <div class="form-group mb-3">
              <label for="editLastname"><i18n:message key="checkout.lastname" /></label>
              <input type="text" id="editLastname" name="editLastname" class="form-control"
                     value="${sessionScope.usuarioApellidos}" readonly>
            </div>
            <div class="form-group mb-3">
              <label for="editAddress"><i18n:message key="checkout.address" /></label>
              <input type="text" id="editAddress" name="editAddress" class="form-control" 
                      value="${sessionScope.usuarioDomicilio}"required>
            </div>
            <div class="form-group mb-3">
              <label for="editCity"><i18n:message key="checkout.city" /></label>
              <input type="text" id="editCity" name="editCity" class="form-control"
                      value="${sessionScope.usuarioPoblacion}"required>
            </div>
            <div class="form-group mb-3">
              <label for="editProvince"><i18n:message key="checkout.province" /></label>
              <input type="text" id="editProvince" name="editProvince" class="form-control" 
                      value= "${sessionScope.usuarioProvincia}"required>
            </div>
            <div class="form-group mb-3">
              <label for="editZip"><i18n:message key="checkout.zip" /></label>
              <input type="text" id="editZip" name="editZip" class="form-control"
                      value= "${sessionScope.usuarioCp}"required>
            </div>
            <div class="form-group mb-4">
              <label for="editPhone"><i18n:message key="checkout.phone" /></label>
              <input type="tel" id="editPhone" name="editPhone" class="form-control"
                  value= "${sessionScope.usuarioTelefono}"required> 
            </div>

            <!-- Campo para modificar email -->
            <div class="form-group mb-3">
              <label for="editEmail"><i18n:message key="checkout.email" /></label>
              <input type="email" id="editEmail" name="editEmail" class="form-control" 
                      value= "${sessionScope.usuarioEmail}" readonly>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex justify-content-between">
              <button type="submit" class="btn btn-primary"><i18n:message key="general.save" /></button>
              <button type="button" class="btn btn-secondary" onclick="location.href='usuario.jsp'"><i18n:message key="general.cancel" /></button>
            </div>
          </form>
        </div>
        
        <!-- Pestaña 2: Métodos de pago -->
        <div class="tab-pane fade" id="pagos" role="tabpanel" aria-labelledby="pagos-tab">
          <div class="row">
            <!-- Columna izquierda: Métodos guardados -->
            <div class="col-md-5">
              <h5><i18n:message key="account.savedMethods" /></h5>
              <div id="loading-payment-methods" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="sr-only"><i18n:message key="general.loading" /></span>
                </div>
                <p class="mb-0 mt-2"><i18n:message key="account.loadingPayments" /></p>
              </div>
              
              <div id="payment-methods-container" class="payment-methods-container">
                <!-- Aquí se cargarán los métodos de pago con JavaScript -->
              </div>
              
              <div id="no-payment-methods" class="text-center py-3" style="display: none;">
                <p class="text-muted mb-0">
                  <i class="fas fa-info-circle"></i> <i18n:message key="account.noPaymentMethods" />
                </p>
              </div>
            </div>
            
            <!-- Columna derecha: Formulario de edición -->
            <div class="col-md-7">
              <h5><i18n:message key="account.editPayment" /></h5>
              <div id="edit-payment-container">
                <p class="text-muted" id="select-method-message">
                  <i class="fas fa-arrow-left"></i> <i18n:message key="account.selectMethod" />
                </p>
                
                <!-- Contenedor para el formulario de edición de método de pago -->
                <div id="edit-payment-form" style="display: none;">
                  <!-- El formulario se cargará dinámicamente con JavaScript -->
                </div>
                
                <!-- Acciones adicionales para métodos de pago favoritos -->
                <div class="payment-actions mt-3" id="payment-actions" style="display: none;">
                  <div class="btn-group">
                    <button type="button" id="btn-set-default" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-star"></i> <i18n:message key="payment.setAsDefault" />
                    </button>
                    <button type="button" id="btn-delete-payment" class="btn btn-sm btn-outline-danger">
                      <i class="fas fa-trash-alt"></i> <i18n:message key="general.delete" />
                    </button>
                  </div>
                  <div class="text-muted small mt-2" id="payment-actions-info">
                    <i18n:message key="payment.actionsInfo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pestaña 3: Cambiar contraseña -->
        <div class="tab-pane fade" id="seguridad" role="tabpanel" aria-labelledby="seguridad-tab">
          <form action="<%= request.getContextPath() %>/cambiardatos-servlet" method="post">
            <input type="hidden" name="accion" value="cambiarPassword">
            
            <!-- Campos para cambio de contraseña -->
            <div class="form-group mb-3">
              <label for="editPasswordActual"><i18n:message key="account.currentPassword" /></label>
              <input type="password" id="editPasswordActual" name="editPasswordActual" class="form-control" required>
            </div>
            <div class="form-group mb-3">
              <label for="editPasswordNueva1"><i18n:message key="account.newPassword" /></label>
              <input type="password" id="editPasswordNueva1" name="editPasswordNueva1" class="form-control" required>
            </div>
            <div class="form-group mb-4">
              <label for="editPasswordNueva2"><i18n:message key="account.confirmPassword" /></label>
              <input type="password" id="editPasswordNueva2" name="editPasswordNueva2" class="form-control" required>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex justify-content-between">
              <button type="submit" class="btn btn-primary"><i18n:message key="account.changePassword" /></button>
              <button type="button" class="btn btn-secondary" onclick="location.href='usuario.jsp'"><i18n:message key="general.cancel" /></button>
            </div>
          </form>
        </div>

        <!-- Pestaña 4: Dirección predeterminada -->
        <div class="tab-pane fade" id="direccion" role="tabpanel" aria-labelledby="direccion-tab">
          <form action="<%= request.getContextPath() %>/direccion-predeterminada-servlet" method="post">
            <input type="hidden" name="accion" value="guardarDireccion">
            
            <div class="form-group mb-3">
              <label for="defaultAddress"><i18n:message key="checkout.address" /></label>
              <input type="text" id="defaultAddress" name="defaultAddress" class="form-control" required>
            </div>
            <div class="form-group mb-3">
              <label for="defaultCity"><i18n:message key="checkout.city" /></label>
              <input type="text" id="defaultCity" name="defaultCity" class="form-control" required>
            </div>
            <div class="form-group mb-3">
              <label for="defaultProvince"><i18n:message key="checkout.province" /></label>
              <input type="text" id="defaultProvince" name="defaultProvince" class="form-control" required>
            </div>
            <div class="form-group mb-3">
              <label for="defaultZip"><i18n:message key="checkout.zip" /></label>
              <input type="text" id="defaultZip" name="defaultZip" class="form-control" required>
            </div>
            <div class="form-group mb-4">
              <label for="defaultPhone"><i18n:message key="checkout.phone" /></label>
              <input type="tel" id="defaultPhone" name="defaultPhone" class="form-control" required>
            </div>
        
            <!-- Botones de acción -->
            <div class="d-flex justify-content-between">
              <button type="submit" class="btn btn-primary"><i18n:message key="general.save" /></button>
              <button type="button" class="btn btn-secondary" onclick="location.href='usuario.jsp'"><i18n:message key="general.cancel" /></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer de la página mediante componente personalizado -->
  <mi-footer></mi-footer>

  <!-- Simple notification system -->
  <script>
    // Sistema de notificaciones básico
    window.Notify = {
      success: function(message) {
        showNotification(message, 'success');
      },
      error: function(message) {
        showNotification(message, 'danger');
      },
      warning: function(message) {
        showNotification(message, 'warning');
      },
      info: function(message) {
        showNotification(message, 'info');
      }
    };
    
    function showNotification(message, type) {
      const container = document.getElementById('notification-container');
      if (!container) return;
      
      const notification = document.createElement('div');
      notification.className = 'alert alert-' + type + ' alert-dismissible fade show';
      notification.innerHTML = message + 
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span></button>';
      
      container.appendChild(notification);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          container.removeChild(notification);
        }, 150);
      }, 5000);
    }
  </script>

  <script>
    // Activar la pestaña según el parámetro de URL
    document.addEventListener('DOMContentLoaded', function() {
      // Obtener el parámetro 'tab' de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      // Si existe el parámetro tab, activar la pestaña correspondiente
      if (tabParam) {
        // Desactivar todas las pestañas
        document.querySelectorAll('.nav-link').forEach(tab => {
          tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('show', 'active');
        });
        
        // Activar la pestaña seleccionada
        const selectedTab = document.getElementById(tabParam + '-tab');
        const selectedPane = document.getElementById(tabParam);
        
        if (selectedTab && selectedPane) {
          selectedTab.classList.add('active');
          selectedPane.classList.add('show', 'active');
        }
      }
    });
  </script>

  <!-- Scripts principales -->
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  
  <!-- Componentes personalizados -->
  <script src="../js/footer.js"></script>
  <script src="../js/cambiardatos.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  <script src="../js/wishlist-page.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>