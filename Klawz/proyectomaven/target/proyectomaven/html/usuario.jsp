<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">

<head>
  <!-- 
    CABECERA HTML
    - Bootstrap y FontAwesome para diseño y componentes.
    - Favicon de la tienda Klawz.
    - style.css: hoja de estilos personalizada del proyecto.
  -->
  <meta charset="UTF-8">
  <title>Mi Cuenta | Klawz</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">

</head>

<body>

  <!-- 
    REDIRECCIÓN SI NO HAY SESIÓN
    - Protege el acceso directo a esta vista.
    - Solo accesible si el usuario ha iniciado sesión correctamente (usuarioId en sesión).
  -->
  <c:if test="${empty sessionScope.usuarioId}">
    <c:redirect url="login.jsp" />
  </c:if>

  <!-- 
    BARRA DE NAVEGACIÓN SUPERIOR
    - Menú común en toda la aplicación.
    - Incluye lógica condicional para mostrar el nombre del usuario si ha iniciado sesión.
  -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="user"/>
  </jsp:include>

  <!-- 
    CUERPO PRINCIPAL: INFORMACIÓN Y ACCIONES DE USUARIO
    - Muestra datos completos del usuario en un diseño de tarjeta
    - Ofrece botones para navegar a distintas secciones relacionadas con la cuenta.
  -->
  <div class="container user-container mt-5">
    <div class="row justify-content-center mt-5 py-5">
      <div class="col-lg-8 col-md-10">
        <div class="user-card">
          <div class="user-header">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <h3>${sessionScope.usuarioNombre} ${sessionScope.usuarioApellidos}</h3>
            <p class="mb-0">${sessionScope.usuarioEmail}</p>
          </div>
          
          <div class="user-content">
            <!-- Información del usuario -->
            <h4 class="section-title"><i class="fas fa-user-circle mr-2"></i><i18n:message key="account.userInfo" /></h4>
            
            <div class="row" id="user-info-container">
              <jsp:useBean id="usuarioDAO" class="tienda.UsuarioDAO" />
              <c:set var="usuario" value="${usuarioDAO.obtenerPorId(sessionScope.usuarioId)}" />
              
              <div class="col-md-6">
                <div class="user-info-item">
                  <div class="user-info-label"><i18n:message key="account.fullName" /></div>
                  <div>${usuario.nombre} ${usuario.apellidos}</div>
                </div>
                
                <div class="user-info-item">
                  <div class="user-info-label"><i18n:message key="checkout.email" /></div>
                  <div>${usuario.email}</div>
                </div>
                
                <div class="user-info-item">
                  <div class="user-info-label"><i18n:message key="checkout.phone" /></div>
                  <div>${usuario.telefono}</div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="user-info-item">
                  <div class="user-info-label"><i18n:message key="checkout.address" /></div>
                  <div>${usuario.domicilio}</div>
                </div>
                
                <div class="user-info-item">
                  <div class="user-info-label"><i18n:message key="checkout.city" />/<i18n:message key="checkout.province" /></div>
                  <div>${usuario.poblacion}, ${usuario.provincia}</div>
                </div>
                
                <div class="user-info-item">
                  <div class="user-info-label"><i18n:message key="checkout.zip" /></div>
                  <div>${usuario.cp}</div>
                </div>
              </div>
            </div>
            
            <!-- Acciones del usuario -->
            <h4 class="section-title mt-4"><i class="fas fa-cog mr-2"></i><i18n:message key="account.options" /></h4>
            
            <div class="user-actions">
              <button onclick="location.href='cambiardatos.jsp'" class="btn btn-primary"><i class="fas fa-user-edit mr-2"></i><i18n:message key="account.edit" /></button>
              
              <button onclick="location.href='gestionpedidos.jsp'" class="btn btn-info"><i class="fas fa-box mr-2"></i><i18n:message key="account.myOrders" /></button>
              
              <button onclick="location.href='cart.jsp'" class="btn btn-success"><i class="fas fa-shopping-cart mr-2"></i><i18n:message key="account.goToCart" /></button>
              
              <a href="${pageContext.request.contextPath}/logout-servlet" class="btn btn-danger"><i class="fas fa-sign-out-alt mr-2"></i><i18n:message key="general.logout" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 
    PIE DE PÁGINA PERSONALIZADO 
    - Web Component "mi-footer" incluido globalmente.
  -->
  <mi-footer></mi-footer>

  <!-- 
    SCRIPTS JS 
    - footer.js carga el componente personalizado del pie de página.
  -->

  <script src="../js/footer.js"></script>
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>

</html>