<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="contact.title" /> | Klawz</title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/x-icon" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
  
</head>

<body>
  <!-- Barra de navegación -->
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="contact"/>
  </jsp:include>

  <!-- Sección de contacto -->
  <section class="my-5 py-5 container">
    <div class="row mt-5">
      <div class="col-md-6">
        <h1><i18n:message key="contact.title" /></h1>
        
        <!-- Información de contacto de la empresa -->
        <div class="contact-info">
          <p><strong>ETSE - Escuela Técnica Superior de Ingeniería (Universidad de Valencia)</strong></p>
          <div class="d-flex align-items-center mb-3">
            <i class="fas fa-map-marker-alt contact-icon mr-3"></i>
            <div>
              <h5><i18n:message key="contact.address" /></h5>
              <p>Avinguda de l'Universitat, 46100 Burjassot, Valencia</p>
            </div>
          </div>
          <div class="d-flex align-items-center mb-3">
            <i class="fas fa-phone-alt contact-icon mr-3"></i>
            <div>
              <h5><i18n:message key="contact.phone" /></h5>
              <p>963 86 41 00</p>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <i class="fas fa-envelope contact-icon mr-3"></i>
            <div>
              <h5><i18n:message key="contact.emailLabel" /></h5>
              <p>abouhamm@alumni.uv.es</p>
            </div>
          </div>
        </div>

        <!-- Mensajes de éxito o error -->
        <c:if test="${not empty sessionScope.exitoContacto}">
          <div class="success-message">
            <i class="fas fa-check-circle"></i> ${sessionScope.exitoContacto}
          </div>
          <c:remove var="exitoContacto" scope="session" />
        </c:if>
        
        <c:if test="${not empty sessionScope.errorContacto}">
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> ${sessionScope.errorContacto}
          </div>
          <c:remove var="errorContacto" scope="session" />
        </c:if>

        <!-- Formulario para que los usuarios puedan enviar consultas -->
        <form action="${pageContext.request.contextPath}/contacto-servlet" method="post">
          <div class="form-group">
            <label for="contactName"><i18n:message key="contact.name" /></label>
            <input type="text" class="form-control" id="contactName" name="contactName" placeholder="<i18n:message key="contact.name" />" required>
          </div>
          <div class="form-group">
            <label for="contactEmail"><i18n:message key="contact.email" /></label>
            <input type="email" class="form-control" id="contactEmail" name="contactEmail" placeholder="<i18n:message key="contact.email" />" required>
          </div>
          <div class="form-group">
            <label for="contactMessage"><i18n:message key="contact.message" /></label>
            <textarea class="form-control" id="contactMessage" name="contactMessage" rows="4" placeholder="<i18n:message key="contact.message" />" required></textarea>
          </div>
          <button type="submit" class="btn btn-custom"><i18n:message key="contact.send" /></button>
        </form>
      </div>

      <!-- Mapa embebido con dirección exacta de la ETSE -->
      <div class="col-md-6">
        <iframe 
          src="https://www.google.com/maps?q=ETSE%20-%20Escuela%20T%C3%A9cnica%20Superior%20de%20Ingenier%C3%ADa%20(Universidad%20de%20Valencia),%20Avinguda%20de%20l%27Universitat,%2046100%20Burjassot,%20Valencia&output=embed"
          style="width: 100%; height: 450px; border: none; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" allowfullscreen aria-hidden="false" tabindex="0">
        </iframe>
      </div>
    </div>
  </section>

  <!-- Pie de página reutilizable -->
  <mi-footer></mi-footer>

  <!-- Scripts -->
  
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
  <script src="../js/footer.js"></script>

  <script src="../js/wishlist.js"></script>
  <script src="../js/minicart.js"></script>

  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>