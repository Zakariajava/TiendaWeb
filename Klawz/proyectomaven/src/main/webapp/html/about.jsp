<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="i18n" uri="http://tienda.com/i18n" %>
<!DOCTYPE html>
<html lang="<%= tienda.LanguageUtil.getCurrentLocale(request).getLanguage() %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><i18n:message key="general.about" /></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <link rel="icon" type="image/ico" href="../img/icono.png" sizes="64x64">
  <link rel="stylesheet" href="../style.css">
</head>

<body>
  <jsp:include page="components/navbar.jsp">
    <jsp:param name="activePage" value="about"/>
  </jsp:include>

  <section class="my-5 py-5 container">
    <div class="row align-items-center mt-5">
      <div class="col-md-6">
        <h1><i18n:message key="general.about" /></h1>
        <p>
          <i18n:message key="general.welcome" /> <i18n:message key="about.description1" />
        </p>
        <p>
          <i18n:message key="about.description2" />
        </p>
      </div>
      <div class="col-md-6">
        <img src="../img/aboutus/aboutus.jpg" alt="<i18n:message key="general.about" />" class="img-fluid rounded-img">
      </div>
    </div>
  </section>

  <mi-footer></mi-footer>

  
  
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>

  <script src="../js/footer.js"></script>
  <script src="../js/index.js"></script>
  <script src="../js/minicart.js"></script>
  <script src="../js/wishlist.js"></script>
  
  <jsp:include page="components/common-scripts.jsp" />
</body>
</html>