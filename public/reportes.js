let proyectos = [];
let posts = [];
let users = [];
let currentUser = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadData();
    setupEventListeners();
    setupDateFilters();
});

// Cargar información del usuario
function loadUserInfo() {
    const userData = JSON.parse(localStorage.getItem('currentUser')) || {
        nombre: 'Usuario Demo',
        correo: 'demo@escuela.edu.mx'
    };
    currentUser = {
        name: userData.nombre || 'Usuario Demo',
        email: userData.correo || 'demo@escuela.edu.mx'
    };
}

// Configurar filtros de fecha
function setupDateFilters() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('fechaDesde').valueAsDate = firstDay;
    document.getElementById('fechaHasta').valueAsDate = today;
}

// Event listeners
function setupEventListeners() {
    // Filtros de fecha
    document.getElementById('fechaDesde').addEventListener('change', updateReports);
    document.getElementById('fechaHasta').addEventListener('change', updateReports);
    document.getElementById('tipoReporte').addEventListener('change', updateReports);
}

// Cargar todos los datos
async function loadData() {
    try {
        // Cargar proyectos
        const proyectosResponse = await fetch('/api/proyectos');
        if (proyectosResponse.ok) {
            proyectos = await proyectosResponse.json();
        }

        // Cargar posts
        const postsResponse = await fetch('/api/posts');
        if (postsResponse.ok) {
            posts = await postsResponse.json();
        }

        // Cargar usuarios
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
            users = await usersResponse.json();
        }

        updateReports();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showErrorMessage('Error al cargar datos del sistema');
    }
}

// Actualizar todos los reportes
function updateReports() {
    updateKPIs();
    updateProyectosChart();
    updateTendenciaChart();
    updateRanking();
    updateODSProgress();
}

// Actualizar KPIs
function updateKPIs() {
    const activos = proyectos.filter(p => p.estado === 'pendiente').length;
    const terminados = proyectos.filter(p => p.estado === 'terminado').length;
    const participantes = users.length;
    const impactoTotal = proyectos.length * 10; // Simulación de impacto

    document.getElementById('totalProyectos').textContent = activos;
    document.getElementById('proyectosTerminados').textContent = terminados;
    document.getElementById('impactoTotal').textContent = impactoTotal;
    document.getElementById('participantes').textContent = participantes;
}

// Actualizar gráfico de proyectos por tipo
function updateProyectosChart() {
    const ctx = document.getElementById('proyectosChart').getContext('2d');
    
    // Simular categorías de impacto
    const tipos = ['Educativo', 'Ambiental', 'Social', 'Tecnológico'];
    const cantidades = [proyectos.filter(p => p.nombre.toLowerCase().includes('educativo')).length,
                       proyectos.filter(p => p.nombre.toLowerCase().includes('ambiental')).length,
                       proyectos.filter(p => p.nombre.toLowerCase().includes('social')).length,
                       proyectos.filter(p => p.nombre.toLowerCase().includes('tecnológico')).length];
    
    // Si no hay categorías específicas, usar distribución genérica
    if (cantidades.every(c => c === 0)) {
        cantidades[0] = Math.floor(proyectos.length * 0.3);
        cantidades[1] = Math.floor(proyectos.length * 0.4);
        cantidades[2] = Math.floor(proyectos.length * 0.2);
        cantidades[3] = proyectos.length - cantidades[0] - cantidades[1] - cantidades[2];
    }

    if (window.proyectosChart && typeof window.proyectosChart.destroy === 'function') {
        window.proyectosChart.destroy();
    }

    window.proyectosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tipos,
            datasets: [{
                label: 'Número de Proyectos',
                data: cantidades,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Actualizar gráfico de tendencia mensual
function updateTendenciaChart() {
    const ctx = document.getElementById('tendenciaChart').getContext('2d');
    
    // Generar datos mensuales (últimos 6 meses)
    const meses = [];
    const datos = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
        const year = date.getFullYear().toString().substr(-2);
        meses.push(`${monthName} ${year}`);
        
        // Simular datos basados en proyectos por mes
        const monthProjects = proyectos.filter(p => {
            const projectDate = new Date(p.fecha);
            return projectDate.getMonth() === date.getMonth() && 
                   projectDate.getFullYear() === date.getFullYear();
        }).length;
        
        datos.push(monthProjects || Math.floor(Math.random() * 15) + 5);
    }

    if (window.tendenciaChart && typeof window.tendenciaChart.destroy === 'function') {
        window.tendenciaChart.destroy();
    }

    window.tendenciaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Actividad Mensual',
                data: datos,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Actualizar ranking de escuelas
function updateRanking() {
    // Simular ranking basado en proyectos
    const escuelas = users.filter(u => u.tipoUsuario === 'escuela')
                         .map(u => ({
                             nombre: u.institucion || u.nombre,
                             correo: u.correo,
                             proyectos: proyectos.filter(p => p.correo === u.correo).length,
                             posts: posts.filter(post => post.email === u.correo).length,
                             participantes: 10 + Math.floor(Math.random() * 50)
                         }))
                         .sort((a, b) => (b.proyectos + b.posts) - (a.proyectos + a.posts))
                         .slice(0, 10);

    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = escuelas.map((escuela, index) => `
        <li class="ranking-item">
            <div class="ranking-position">${index + 1}</div>
            <div class="ranking-school">${escuela.nombre}</div>
            <div class="ranking-stats">
                <div class="ranking-stat">
                    <div class="stat-number">${escuela.proyectos}</div>
                    <div class="stat-label">Proyectos</div>
                </div>
                <div class="ranking-stat">
                    <div class="stat-number">${escuela.posts}</div>
                    <div class="stat-label">Posts</div>
                </div>
            </div>
        </li>
    `).join('');
}

// Actualizar progreso ODS
function updateODSProgress() {
    const odsItems = [
        { 
            nombre: 'ODS 4', 
            objetivo: 'Educación de Calidad', 
            descripcion: 'Garantizar una educación inclusiva, equitativa y de calidad',
            progreso: 75,
            icon: 'fas fa-graduation-cap'
        },
        { 
            nombre: 'ODS 13', 
            objetivo: 'Acción por el Clima', 
            descripcion: 'Adoptar medidas urgentes para combatir el cambio climático',
            progreso: 60,
            icon: 'fas fa-cloud-sun'
        },
        { 
            nombre: 'ODS 15', 
            objetivo: 'Vida de Ecosistemas', 
            descripcion: 'Proteger, restaurar y promover el uso sostenible de ecosistemas',
            progreso: 80,
            icon: 'fas fa-tree'
        },
        { 
            nombre: 'ODS 3', 
            objetivo: 'Salud y Bienestar', 
            descripcion: 'Garantizar una vida sana y promover el bienestar',
            progreso: 45,
            icon: 'fas fa-heartbeat'
        },
        { 
            nombre: 'ODS 12', 
            objetivo: 'Producción Responsable', 
            descripcion: 'Garantizar modalidades de consumo y producción sostenibles',
            progreso: 55,
            icon: 'fas fa-recycle'
        },
        { 
            nombre: 'ODS 11', 
            objetivo: 'Ciudades Sostenibles', 
            descripcion: 'Lograr que las ciudades sean inclusivas, seguras y sostenibles',
            progreso: 35,
            icon: 'fas fa-city'
        }
    ];

    const odsGrid = document.getElementById('odsGrid');
    odsGrid.innerHTML = odsItems.map(ods => `
        <div class="ods-item">
            <div class="ods-header">
                <i class="${ods.icon} ods-icon"></i>
                <div class="ods-title">${ods.nombre} - ${ods.objetivo}</div>
            </div>
            <div class="ods-description">${ods.descripcion}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${ods.progreso}%;"></div>
            </div>
            <div class="progress-text">${ods.progreso}% completado</div>
        </div>
    `).join('');
}

// Exportar a Excel
function exportarExcel() {
    Swal.fire({
        title: 'Exportando datos...',
        text: 'Generando archivo Excel con los reportes',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    // Simular proceso de exportación
    setTimeout(() => {
        // Generar datos para exportar
        const datosExportacion = generarDatosExportacion();
        
        // Crear y descargar archivo CSV (simulado)
        descargarCSV(datosExportacion);
        
        Swal.fire({
            title: '¡Exportado!',
            text: 'El archivo Excel ha sido generado exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    }, 2000);
}

// Generar datos completos para exportación
function generarDatosExportacion() {
    const fechaActual = new Date().toLocaleDateString('es-ES');
    
    // Datos de escuelas
    const datosEscuelas = users.filter(u => u.tipoUsuario === 'escuela').map(user => ({
        'Tipo': 'Escuela',
        'Nombre': user.nombre,
        'Correo': user.correo,
        'Institución': user.institucion,
        'Fecha_Registro': user.fechaCreacion ? new Date(user.fechaCreacion).toLocaleDateString('es-ES') : fechaActual,
        'Proyectos_Activos': proyectos.filter(p => p.correo === user.correo).length,
        'Publicaciones_Foro': posts.filter(post => post.email === user.correo).length,
        'Estado': user.activo ? 'Activo' : 'Inactivo'
    }));

    // Datos de proyectos
    const datosProyectos = proyectos.map(proyecto => ({
        'Tipo': 'Proyecto',
        'Nombre': proyecto.nombre,
        'Descripción': proyecto.descripcion.substring(0, 100) + '...',
        'Usuario': proyecto.usuario,
        'Correo_Usuario': proyecto.correo,
        'Categoría': proyecto.categoria,
        'Estado': proyecto.estado === 'terminado' ? 'Terminado' : 'Pendiente',
        'Fecha_Creación': new Date(proyecto.fecha).toLocaleDateString('es-ES'),
        'Likes': proyecto.likes || 0,
        'Comentarios': proyecto.comentarios ? proyecto.comentarios.length : 0
    }));

    // Datos de posts
    const datosPosts = posts.map(post => ({
        'Tipo': 'Publicación',
        'Título': post.title,
        'Contenido': post.content.substring(0, 100) + '...',
        'Usuario': post.user,
        'Correo_Usuario': post.email,
        'Categoría': post.category,
        'Fecha_Publicación': new Date(post.date).toLocaleDateString('es-ES'),
        'Likes': post.likes || 0,
        'Comentarios': post.comments ? post.comments.length : 0
    }));

    // Combinar todos los datos
    return [...datosEscuelas, ...datosProyectos, ...datosPosts];
}

// Descargar datos como CSV
function descargarCSV(datos) {
    if (datos.length === 0) {
        console.warn('No hay datos para exportar');
        return;
    }

    // Crear encabezados
    const encabezados = Object.keys(datos[0]).join(',');
    
    // Crear filas de datos
    const filas = datos.map(obj => {
        return Object.values(obj).map(valor => {
            // Escapar comillas y comas en valores
            if (typeof valor === 'string') {
                return `"${valor.replace(/"/g, '""')}"`;
            }
            return valor;
        }).join(',');
    });
    
    // Combinar todo
    const csv = [encabezados, ...filas].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reportes_escologia_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'Aceptar'
    });
}

// Función para volver atrás
function goBack() {
    window.location.href = '/home';
}