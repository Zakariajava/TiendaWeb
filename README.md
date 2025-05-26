# 🛍️ Klawz - Tienda Web de Moda

Una aplicación web completa de comercio electrónico desarrollada con tecnologías Java/JSP y PHP, especializada en productos de moda y accesorios.

#  Capturas de Pantalla

(./screenshots/1.png)
(./screenshots/2.png)
(./screenshots/3.png)
(./screenshots/4.png)
(./screenshots/5.png)
(./screenshots/6.png)
(./screenshots/7.png)
## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Funcionalidades](#-funcionalidades)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [API Endpoints](#-api-endpoints)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características Principales

- 🛒 **E-commerce completo** con catálogo de productos
- 👤 **Sistema de usuarios** con autenticación segura
- 🛍️ **Carrito de compras** y proceso de checkout
- ❤️ **Lista de deseos** personalizada
- 📦 **Gestión de pedidos** en tiempo real
- 🌍 **Multiidioma** (7 idiomas soportados)
- 🎨 **Modo oscuro** adaptable
- 📱 **Diseño responsive** con Bootstrap
- 🔐 **Panel de administración** completo
- 💳 **Sistema de pagos** integrado

## 🛠️ Tecnologías Utilizadas

### Backend
- **Java 11+** - Lógica de negocio
- **Jakarta Servlets** - Controladores web
- **JSP** - Vistas dinámicas
- **Maven** - Gestión de dependencias
- **MariaDB/MySQL** - Base de datos

### Frontend
- **HTML5 & CSS3** - Estructura y estilos
- **JavaScript ES6+** - Interactividad
- **Bootstrap 4** - Framework CSS
- **Font Awesome** - Iconografía
- **AJAX** - Comunicación asíncrona

### Administración
- **PHP 8+** - Panel de administración
- **Custom CSS** - Estilos personalizados

### Herramientas
- **Git** - Control de versiones
- **ResourceBundle** - Internacionalización
- **JSON** - Intercambio de datos

## 📁 Estructura del Proyecto

```
TiendaWeb/
├── Klawz/
│   ├── admin/                          # Panel de administración (PHP)
│   │   ├── css/
│   │   │   └── admin.css              # Estilos del panel admin
│   │   ├── js/
│   │   │   └── admin.js               # Funcionalidad del panel
│   │   ├── lib/                       # Librerías PHP
│   │   │   ├── BaseDatos.php          # Clase de acceso a BD
│   │   │   ├── config.php             # Configuración BD
│   │   │   └── verificar_sesion.php   # Middleware de sesión
│   │   ├── dashboard.php              # Panel principal
│   │   ├── productos.php              # Gestión de productos
│   │   ├── pedidos.php                # Gestión de pedidos
│   │   └── usuarios.php               # Gestión de usuarios
│   │
│   └── proyectomaven/                 # Aplicación principal (Java)
│       ├── src/main/java/tienda/      # Código fuente Java
│       │   ├── AccesoBD.java          # Conexión a base de datos
│       │   ├── ProductoServlet.java   # Controlador de productos
│       │   ├── UsuarioDAO.java        # Acceso a datos de usuarios
│       │   ├── CheckoutServlet.java   # Proceso de compra
│       │   └── ...                    # Otros servlets y DAOs
│       │
│       ├── src/main/resources/tienda/ # Recursos de internacionalización
│       │   ├── messages_es.properties # Textos en español
│       │   ├── messages_en.properties # Textos en inglés
│       │   ├── messages_fr.properties # Textos en francés
│       │   ├── messages_de.properties # Textos en alemán
│       │   ├── messages_ar.properties # Textos en árabe
│       │   ├── messages_ber.properties# Textos en bereber
│       │   └── messages_chi.properties# Textos en chino
│       │
│       └── src/main/webapp/           # Recursos web
│           ├── html/                  # Páginas JSP
│           │   ├── index.jsp          # Página principal
│           │   ├── shop.jsp           # Catálogo de productos
│           │   ├── cart.jsp           # Carrito de compras
│           │   ├── usuario.jsp        # Panel de usuario
│           │   └── components/        # Componentes reutilizables
│           ├── js/                    # Scripts JavaScript
│           │   ├── shop.js            # Funcionalidad del catálogo
│           │   ├── cart.js            # Lógica del carrito
│           │   ├── wishlist.js        # Lista de deseos
│           │   └── minicart.js        # Mini carrito
│           ├── img/                   # Imágenes y recursos
│           └── style.css              # Estilos principales
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Java JDK 11+
- Apache Tomcat 9+
- MariaDB/MySQL 8+
- PHP 8+ (para panel de administración)
- Maven 3.6+

### Configuración de Base de Datos

1. **Crear la base de datos:**
```sql
CREATE DATABASE klawz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Configurar conexión en Java:**
```java
// src/main/java/tienda/AccesoBD.java
private static final String URL = "jdbc:mariadb://localhost:3306/klawz";
private static final String USER = "root";
private static final String PASSWORD = "root";
```

3. **Configurar conexión en PHP:**
```php
// admin/lib/config.php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'klawz');
```

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/usuario/tienda-web-klawz.git
cd tienda-web-klawz
```

2. **Compilar el proyecto Maven:**
```bash
cd Klawz/proyectomaven
mvn clean compile
mvn package
```

3. **Desplegar en Tomcat:**
```bash
cp target/klawz.war $TOMCAT_HOME/webapps/
```

4. **Configurar el servidor web para PHP** (Apache/Nginx) para el panel de administración.

5. **Importar datos de prueba** (opcional):
```bash
mysql -u root -p klawz < database/sample_data.sql
```

## 🎯 Funcionalidades

### Para Usuarios
- ✅ Registro y autenticación de usuarios
- ✅ Navegación por catálogo con filtros avanzados
- ✅ Búsqueda de productos en tiempo real
- ✅ Gestión de carrito de compras
- ✅ Lista de deseos personalizada
- ✅ Proceso de checkout completo
- ✅ Gestión de perfil y direcciones
- ✅ Historial de pedidos
- ✅ Cambio de idioma dinámico
- ✅ Modo oscuro/claro

### Para Administradores
- ✅ Panel de control con estadísticas
- ✅ Gestión completa de productos (CRUD)
- ✅ Administración de usuarios
- ✅ Seguimiento de pedidos
- ✅ Gestión de estados de pedidos
- ✅ Sistema de mensajes/contacto
- ✅ Reportes y analytics

### Características Técnicas
- ✅ Arquitectura MVC
- ✅ Patrón DAO para acceso a datos
- ✅ Consultas preparadas (SQL injection prevention)
- ✅ Validación de datos en cliente y servidor
- ✅ Manejo de sesiones seguro
- ✅ Internacionalización completa
- ✅ Diseño responsive
- ✅ Optimización de rendimiento

## 🌍 Idiomas Soportados

| Idioma | Código | Estado |
|--------|--------|--------|
| Español | `es` | ✅ Completo |
| Inglés | `en` | ✅ Completo |
| Francés | `fr` | ✅ Completo |
| Alemán | `de` | ✅ Completo |
| Árabe | `ar` | ✅ Completo |
| Bereber | `ber` | ✅ Completo |
| Chino | `chi` | ✅ Completo |

## 📱 API Endpoints Principales

### Productos
```
GET  /productos              - Listar productos
GET  /producto-detalle?id=X   - Detalle de producto
GET  /producto-index          - Productos para página principal
```

### Usuario
```
POST /login-servlet           - Iniciar sesión
POST /registro-servlet        - Registro de usuario
POST /cambiardatos-servlet    - Actualizar perfil
GET  /logout-servlet          - Cerrar sesión
```

### Carrito y Pedidos
```
POST /checkout-servlet        - Procesar pedido
GET  /pedido-servlet         - Obtener pedidos del usuario
POST /cancelar-pedido        - Cancelar pedido
```

### Internacionalización
```
GET  /cambiar-idioma?lang=X   - Cambiar idioma
GET  /translations.jsp        - Obtener traducciones
```

## 🎨 Capturas de Pantalla

*[Aquí se incluirían capturas de pantalla de la aplicación]*

### Página Principal
- Hero section con productos destacados
- Catálogo por categorías
- Banners promocionales

### Catálogo de Productos
- Filtros avanzados por categoría y subcategoría
- Búsqueda en tiempo real
- Vista de grid responsive

### Carrito de Compras
- Gestión de cantidades
- Cálculo de totales automático
- Proceso de checkout fluido

### Panel de Usuario
- Gestión de perfil
- Historial de pedidos
- Lista de deseos

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=klawz
DB_USER=root
DB_PASSWORD=root

# Aplicación
APP_ENV=production
APP_DEBUG=false
```

### Personalización de Estilos
Los estilos principales se encuentran en:
- `webapp/style.css` - Estilos principales
- `admin/css/admin.css` - Estilos del panel de administración

### Configuración de Idiomas
Para añadir un nuevo idioma:
1. Crear archivo `messages_XX.properties` en `src/main/resources/tienda/`
2. Añadir el código de idioma en `LanguageUtil.java`
3. Actualizar el selector de idioma en `language-selector.jsp`

## 🧪 Testing

```bash
# Ejecutar tests unitarios
mvn test

# Ejecutar tests de integración
mvn integration-test

# Generar reporte de cobertura
mvn jacoco:report
```

## 📈 Performance

### Optimizaciones Implementadas
- ✅ Lazy loading de imágenes
- ✅ Compresión CSS/JS
- ✅ Caching de consultas frecuentes
- ✅ Paginación en listados
- ✅ Conexiones de BD optimizadas

### Métricas Objetivo
- Tiempo de carga inicial: < 2s
- Tiempo de respuesta API: < 500ms
- Puntuación Lighthouse: > 90

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código
- Java: Seguir convenciones de Oracle
- JavaScript: Usar ES6+ y JSDoc para documentación
- CSS: Metodología BEM para nomenclatura
- Commits: Usar Conventional Commits

## 📝 Roadmap

### Versión 2.0
- [ ] Implementar PWA
- [ ] Sistema de reviews y valoraciones
- [ ] Chat en tiempo real
- [ ] Integración con redes sociales
- [ ] Sistema de cupones y descuentos
- [ ] Dashboard de analytics avanzado

### Versión 2.1
- [ ] Aplicación móvil nativa
- [ ] Inteligencia artificial para recomendaciones
- [ ] Sistema de afiliados
- [ ] Multi-vendor marketplace

## 🐛 Problemas Conocidos

- Compatibilidad limitada con Internet Explorer
- Rendimiento en dispositivos de gama baja
- Límite de 100 productos por página en el catálogo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Zakaria Abouhammadi**
- Email: abouhamm@alumni.uv.es
- Universidad: ETSE - Universidad de Valencia
- GitHub: [@zakaria-abouhammadi](https://github.com/zakaria-abouhammadi)

## 🙏 Agradecimientos

- Universidad de Valencia - ETSE
- Profesores del curso de Desarrollo Web
- Bootstrap Team por el framework CSS
- Font Awesome por los iconos
- Comunidad open source

---

⭐ **¡Si te gusta este proyecto, dale una estrella!** ⭐
