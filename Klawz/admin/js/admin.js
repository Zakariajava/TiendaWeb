/**
 * admin.js
 * --------
 * Script para añadir funcionalidades interactivas al panel de administración
 * 
 * @author Zakaria abouhammadi
 * @version 1.1
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Verificar si llegamos con parámetro de modo oscuro en la URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('darkMode')) {
        localStorage.setItem('darkMode', 'enabled');
        document.body.classList.add('dark-mode');
    }
    
    // 2. Comprobar preferencia guardada para el modo oscuro (MOVIDO AL INICIO)
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers de Bootstrap
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Toggle para el sidebar en dispositivos móviles
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }

    // Toggle para el modo oscuro
    const darkModeToggle = document.querySelector('.btn-toggle-dark-mode');
    if (darkModeToggle) {
        // 3. Actualizar el icono al cargar la página
        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                this.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('darkMode', 'disabled');
                this.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }

    // Animación para las tarjetas del dashboard
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach((card, index) => {
        card.style.animationDelay = `${0.1 * index}s`;
        card.classList.add('fade-in');
    });

    // Efecto de carga para las tablas de datos
    const dataTable = document.querySelector('.data-table');
    if (dataTable) {
        // Mostrar spinner de carga
        const loadingOverlay = document.createElement('div');
        loadingOverlay.classList.add('loading-overlay');
        loadingOverlay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Cargando...</span></div>';
        dataTable.parentNode.insertBefore(loadingOverlay, dataTable);
        
        // Simular carga de datos
        setTimeout(() => {
            loadingOverlay.classList.add('loaded');
            setTimeout(() => {
                loadingOverlay.remove();
                dataTable.classList.add('loaded');
            }, 300);
        }, 500);
    }

    // Efecto de carga para enlaces de navegación
    const navLinks = document.querySelectorAll('.sidebar .nav-link, .btn[href]:not([href="#"]):not([target="_blank"])');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // No aplicar efecto a links que tengan confirm
            if (this.getAttribute('onclick') && this.getAttribute('onclick').includes('confirm')) {
                return;
            }
            
            // No aplicar a links con hash o javascript:void
            const href = this.getAttribute('href');
            if (href === '#' || href === 'javascript:void(0)' || href.startsWith('#')) {
                return;
            }
            
            e.preventDefault();
            
            // Crear y mostrar overlay de carga
            const loadingOverlay = document.createElement('div');
            loadingOverlay.classList.add('page-transition-overlay');
            loadingOverlay.innerHTML = '<div class="page-loader"></div>';
            document.body.appendChild(loadingOverlay);
            
            // Activar overlay
            setTimeout(() => {
                loadingOverlay.classList.add('active');
                
                // 4. Navegar a la nueva página conservando el modo oscuro
                setTimeout(() => {
                    // Añadir parámetro para preservar el modo oscuro si está activo
                    let navigateUrl = href;
                    if (document.body.classList.contains('dark-mode')) {
                        // Añadir parámetro para indicar modo oscuro
                        navigateUrl += (navigateUrl.includes('?') ? '&' : '?') + 'darkMode=1';
                    }
                    window.location.href = navigateUrl;
                }, 300);
            }, 10);
        });
    });

    // Notificaciones toast para mensajes de éxito/error
    const alerts = document.querySelectorAll('.alert-success, .alert-danger');
    alerts.forEach(alert => {
        // Crear toast equivalente
        const toast = document.createElement('div');
        toast.classList.add('toast', 'show', alert.classList.contains('alert-success') ? 'bg-success' : 'bg-danger', 'text-white');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        
        // Contenido del toast
        toast.innerHTML = `
            <div class="toast-header bg-${alert.classList.contains('alert-success') ? 'success' : 'danger'} text-white">
                <strong class="mr-auto">${alert.classList.contains('alert-success') ? 'Éxito' : 'Error'}</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                ${alert.innerHTML}
            </div>
        `;
        
        // Añadir al DOM
        document.body.appendChild(toast);
        
        // Configurar auto-cierre
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 5000);
        
        // Manejador para botón de cierre
        toast.querySelector('.close').addEventListener('click', function() {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 500);
        });
        
        // Ocultar alerta original
        alert.style.display = 'none';
    });

    // Contador de notificaciones animado
    const badges = document.querySelectorAll('.badge-pill');
    badges.forEach(badge => {
        badge.classList.add('badge-animate');
    });

    // Efecto de hover para los botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('btn-hover-effect');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('btn-hover-effect');
        });
    });

    // Efecto de pulsación para botones
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.classList.add('btn-active-effect');
        });
        
        button.addEventListener('mouseup', function() {
            this.classList.remove('btn-active-effect');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('btn-active-effect');
        });
    });

    // Filtro de búsqueda en tablas
    const searchInput = document.getElementById('table-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const value = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.data-table tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.indexOf(value) > -1) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Contador de caracteres en textareas
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        
        // Crear contador
        const counter = document.createElement('small');
        counter.classList.add('text-muted', 'character-counter');
        counter.textContent = `${textarea.value.length}/${maxLength}`;
        
        // Añadir después del textarea
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        
        // Actualizar contador al escribir
        textarea.addEventListener('input', function() {
            counter.textContent = `${this.value.length}/${maxLength}`;
            
            // Cambiar color cuando se acerca al límite
            if (this.value.length > maxLength * 0.8) {
                counter.classList.add('text-warning');
            } else {
                counter.classList.remove('text-warning');
            }
            
            if (this.value.length > maxLength * 0.95) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        });
    });

    // Confirmar antes de acciones destructivas
    const destructiveActions = document.querySelectorAll('.btn-danger[href]:not([onclick*="confirm"])');
    destructiveActions.forEach(button => {
        const originalHref = button.getAttribute('href');
        button.setAttribute('href', 'javascript:void(0)');
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('¿Está seguro de realizar esta acción? Esta operación no se puede deshacer.')) {
                // 5. Preservar el modo oscuro en redirecciones de confirmación
                let redirectUrl = originalHref;
                if (document.body.classList.contains('dark-mode')) {
                    redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + 'darkMode=1';
                }
                window.location.href = redirectUrl;
            }
        });
    });

    // Inicializar datepickers
    const datepickers = document.querySelectorAll('input[type="date"]');
    datepickers.forEach(datepicker => {
        // Añadir clase para estilizado
        datepicker.classList.add('datepicker-styled');
        
        // Si está vacío, establecer la fecha actual
        if (!datepicker.value) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            datepicker.value = `${year}-${month}-${day}`;
        }
    });

    // Inicializar selectores mejorados
    const selects = document.querySelectorAll('select:not(.native-select)');
    selects.forEach(select => {
        select.classList.add('select-styled');
    });
});