// public/script.js - JavaScript para funcionalidad del login

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('contraseña');
    const statusMessage = document.getElementById('statusMessage');
    const loginButton = document.getElementById('loginButton');
    
    // Modal de registro
    const registerModal = document.getElementById('registerModal');
    const registerLink = document.getElementById('registerLink');
    const closeModal = document.getElementById('closeModal');
    const registerForm = document.getElementById('registerForm');

    // Funcionalidad para mostrar/ocultar contraseña
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar el ícono
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Manejar envío del formulario de login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevenir envío por defecto
        
        // Limpiar mensajes de error previos
        limpiarErrores();
        
        // Obtener datos del formulario
        const formData = new FormData(loginForm);
        const datos = {
            correo: formData.get('correo'),
            contraseña: formData.get('contraseña')
        };
        
        // Validar datos antes de enviar
        if (!validarLogin(datos)) {
            return;
        }
        
        // Mostrar estado de carga
        mostrarCargando(true);
        
        try {
            // Realizar petición al servidor
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });
            
            const resultado = await response.json();
            
            if (resultado.success) {
                // Login exitoso
                mostrarMensaje('success', '¡Login exitoso! Bienvenido ' + resultado.usuario.nombre);
                
                // Aquí normalmente redirigirías al dashboard
                setTimeout(() => {
                    alert('Redirigiendo al dashboard...\nUsuario: ' + resultado.usuario.nombre + '\nInstitución: ' + resultado.usuario.institucion);
                }, 1500);
                
            } else {
                // Error en el login
                mostrarMensaje('error', resultado.message);
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            mostrarMensaje('error', 'Error de conexión. Por favor intenta nuevamente.');
        } finally {
            mostrarCargando(false);
        }
    });

    // Funciones de validación
    function validarLogin(datos) {
        let esValido = true;
        
        // Validar correo electrónico
        if (!datos.correo) {
            mostrarError('correoError', 'El correo es obligatorio');
            esValido = false;
        } else if (!validarEmail(datos.correo)) {
            mostrarError('correoError', 'Ingresa un correo válido');
            esValido = false;
        }
        
        // Validar contraseña
        if (!datos.contraseña) {
            mostrarError('contraseñaError', 'La contraseña es obligatoria');
            esValido = false;
        } else if (datos.contraseña.length < 6) {
            mostrarError('contraseñaError', 'La contraseña debe tener al menos 6 caracteres');
            esValido = false;
        }
        
        return esValido;
    }
    
    // Función para validar formato de email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Función para mostrar errores específicos
    function mostrarError(elementoId, mensaje) {
        const errorElement = document.getElementById(elementoId);
        if (errorElement) {
            errorElement.textContent = mensaje;
        }
    }
    
    // Función para limpiar errores
    function limpiarErrores() {
        const errores = document.querySelectorAll('.error-message');
        errores.forEach(error => error.textContent = '');
        statusMessage.className = 'status-message hidden';
    }
    
    // Función para mostrar mensajes de estado
    function mostrarMensaje(tipo, mensaje) {
        statusMessage.textContent = mensaje;
        statusMessage.className = `status-message ${tipo}`;
    }
    
    // Función para mostrar estado de carga
    function mostrarCargando(cargando) {
        if (cargando) {
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        } else {
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
    }

    // === FUNCIONALIDAD DEL MODAL DE REGISTRO ===
    
    // Abrir modal de registro
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    });
    
    // Cerrar modal
    closeModal.addEventListener('click', function() {
        cerrarModal();
    });
    
    // Cerrar modal al hacer clic fuera
    registerModal.addEventListener('click', function(e) {
        if (e.target === registerModal) {
            cerrarModal();
        }
    });
    
    function cerrarModal() {
        registerModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        registerForm.reset();
        document.getElementById('registerStatusMessage').className = 'status-message hidden';
    }
    
    // Manejar envío del formulario de registro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const datos = {
            nombre: formData.get('nombre'),
            correo: formData.get('correo'),
            contraseña: formData.get('contraseña'),
            institucion: formData.get('institucion'),
            tipoUsuario: 'escuela'
        };
        
        const registerStatusMessage = document.getElementById('registerStatusMessage');
        const submitButton = registerForm.querySelector('button[type="submit"]');
        
        // Mostrar carga
        submitButton.disabled = true;
        submitButton.textContent = 'Registrando...';
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });
            
            const resultado = await response.json();
            
            if (resultado.success) {
                registerStatusMessage.textContent = '¡Registro exitoso! Ya puedes iniciar sesión.';
                registerStatusMessage.className = 'status-message success';
                
                setTimeout(() => {
                    cerrarModal();
                    // Llenar el formulario de login con el correo registrado
                    document.getElementById('correo').value = datos.correo;
                }, 2000);
                
            } else {
                registerStatusMessage.textContent = resultado.message || 'Error en el registro';
                registerStatusMessage.className = 'status-message error';
            }
            
        } catch (error) {
            console.error('Error en registro:', error);
            registerStatusMessage.textContent = 'Error de conexión. Intenta nuevamente.';
            registerStatusMessage.className = 'status-message error';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarse';
        }
    });

    // Validación en tiempo real para los campos de entrada
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validarCampoIndividual(this);
        });
        
        // Limpiar error cuando el usuario empieza a escribir
        input.addEventListener('input', function() {
            const errorElement = document.getElementById(this.id + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
    
    // Función para validar campos individuales
    function validarCampoIndividual(campo) {
        const valor = campo.value.trim();
        const errorElement = document.getElementById(campo.id + 'Error');
        
        if (!errorElement) return;
        
        let mensaje = '';
        
        switch (campo.type) {
            case 'email':
                if (valor && !validarEmail(valor)) {
                    mensaje = 'Formato de email inválido';
                }
                break;
            case 'password':
                if (valor && valor.length < 6) {
                    mensaje = 'Mínimo 6 caracteres';
                }
                break;
        }
        
        errorElement.textContent = mensaje;
    }
    
    console.log('🚀 Sistema de login inicializado correctamente');
});