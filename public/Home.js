// Función para redirigir con SweetAlert
function redirectTo(page) {
    const pageNames = {
        'registro': 'Registro',
        'perfil-escuela': 'Perfil de Escuela',
        'mapa-colaborativo': 'Mapa Colaborativo',
        'publicacion-proyectos': 'Publicación de Proyectos',
        'monitoreo-iot': 'Monitoreo IoT',
        'foros-chat': 'Foros y Chat',
        'panel-administrativo': 'Panel Administrativo',
        'reportes': 'Reportes'
    };

    const pageName = pageNames[page] || page;

    Swal.fire({
        title: 'Redirigiendo...',
        text: `Redirigiendo a ${pageName}`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 2000,
        timerProgressBar: true,
        willOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        // Aquí puedes redirigir a la página correspondiente
        // Por ahora mostramos un mensaje de ejemplo
        alert(`Redirigiendo a: ${pageName}\n\nEn una implementación real, aquí se cargaría la página: ${page}.html`);
    });
}

// Cargar información del usuario
function loadUserInfo() {
    // Simular carga de usuario (en realidad vendría del login)
    const userData = JSON.parse(localStorage.getItem('currentUser')) || {
        nombre: 'Usuario Demo',
        institucion: 'Escuela Demo'
    };
    document.getElementById('userName').textContent = userData.nombre || 'Usuario';
}

// Cargar clima
function loadWeather() {
    // Simular carga de clima - en una implementación real usarías la API
    // Por ahora mostramos datos simulados
    const weatherConditions = ['Soleado', 'Parcialmente nublado', 'Nublado', 'Lluvioso'];
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const randomTemp = Math.floor(Math.random() * 10) + 20; // 20-30°C
    
    document.getElementById('weatherData').innerHTML = `
        <i class="fas fa-sun"></i> ${randomTemp}°C • ${randomCondition}
    `;
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadWeather();
    
    console.log('Home Dashboard inicializado correctamente');
});

// Función para simular actualización de estadísticas
setInterval(() => {
    // Esto simula actualización de datos en tiempo real
    document.getElementById('schoolsCount').textContent = Math.floor(Math.random() * 5) + 10;
    document.getElementById('projectsCount').textContent = Math.floor(Math.random() * 3) + 6;
    document.getElementById('collaboratorsCount').textContent = Math.floor(Math.random() * 10) + 40;
}, 10000);