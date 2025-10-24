// public/script.js - JavaScript para funcionalidad del login CON SESIONES

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
        
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // ✅ Manejar envío del formulario de login CON SESIONES
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        limpiarErrores();
        
        const formData = new FormData(loginForm);
        const datos = {
            correo: formData.get('correo'),
            contraseña: formData.get('contraseña')
        };
        
        if (!validarLogin(datos)) {
            return;
        }
        
        mostrarCargando(true);
        
        try {
            // ✅ Realizar petición al servidor CON credenciales (cookies)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // ✅ IMPORTANTE: Incluir cookies
                body: JSON.stringify(datos)
            });
            
            const resultado = await response.json();
            
            if (resultado.success) {
                // Login exitoso
                // ✅ YA NO necesitamos guardar en localStorage
                // El servidor maneja la sesión con cookies automáticamente
                
                Swal.fire({
                    title: '¡Inicio de sesión exitoso!',
                    text: `Bienvenido ${resultado.usuario.nombre}`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => {
                    // ✅ Simplemente redirigir - la sesión ya está activa
                    window.location.href = '/home';
                });
                
            } else {
                Swal.fire({
                    title: 'Error de inicio de sesión',
                    text: resultado.message || 'Credenciales incorrectas',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            Swal.fire({
                title: 'Error de conexión',
                text: 'Error de conexión. Por favor intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Reintentar'
            });
        } finally {
            mostrarCargando(false);
        }
    });

    // Funciones de validación
    function validarLogin(datos) {
        let esValido = true;
        
        if (!datos.correo) {
            mostrarError('correoError', 'El correo es obligatorio');
            esValido = false;
        } else if (!validarEmail(datos.correo)) {
            mostrarError('correoError', 'Ingresa un correo válido');
            esValido = false;
        } else if (!validarEmailFormatoEstricto(datos.correo)) {
            mostrarError('correoError', 'Formato de correo no permitido');
            esValido = false;
        }
        
        if (!datos.contraseña) {
            mostrarError('contraseñaError', 'La contraseña es obligatoria');
            esValido = false;
        } else if (datos.contraseña.length < 6) {
            mostrarError('contraseñaError', 'La contraseña debe tener al menos 6 caracteres');
            esValido = false;
        } else if (!validarContraseñaSegura(datos.contraseña)) {
            mostrarError('contraseñaError', 'La contraseña debe contener mayúsculas, minúsculas y números');
            esValido = false;
        }
        
        return esValido;
    }
    
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function validarEmailFormatoEstricto(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }
    
    function validarContraseñaSegura(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
        return regex.test(password);
    }
    
    function mostrarError(elementoId, mensaje) {
        const errorElement = document.getElementById(elementoId);
        if (errorElement) {
            errorElement.textContent = mensaje;
        }
    }
    
    function limpiarErrores() {
        const errores = document.querySelectorAll('.error-message');
        errores.forEach(error => error.textContent = '');
        statusMessage.className = 'status-message hidden';
    }
    
    function mostrarMensaje(tipo, mensaje) {
        statusMessage.textContent = mensaje;
        statusMessage.className = `status-message ${tipo}`;
    }
    
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
    
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    closeModal.addEventListener('click', function() {
        cerrarModal();
    });
    
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
        
        if (!validarRegistro(datos)) {
            return;
        }
        
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
                Swal.fire({
                    title: '¡Registro exitoso!',
                    text: 'Ya puedes iniciar sesión con tus credenciales',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    cerrarModal();
                    document.getElementById('correo').value = datos.correo;
                });
                
            } else {
                Swal.fire({
                    title: 'Error en el registro',
                    text: resultado.message || 'Error en el registro',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
            
        } catch (error) {
            console.error('Error en registro:', error);
            Swal.fire({
                title: 'Error de conexión',
                text: 'Error de conexión. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Reintentar'
            });
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarse';
        }
    });

    function validarRegistro(datos) {
        let esValido = true;
        
        if (!datos.nombre || datos.nombre.length < 3) {
            mostrarError('regNombreError', 'Nombre debe tener al menos 3 caracteres');
            esValido = false;
        } else if (!validarNombre(datos.nombre)) {
            mostrarError('regNombreError', 'Nombre contiene caracteres no permitidos');
            esValido = false;
        }
        
        if (!datos.correo) {
            mostrarError('regCorreoError', 'Correo es obligatorio');
            esValido = false;
        } else if (!validarEmail(datos.correo)) {
            mostrarError('regCorreoError', 'Formato de correo inválido');
            esValido = false;
        } else if (!validarEmailEducacional(datos.correo)) {
            mostrarError('regCorreoError', 'Solo se permiten correos educativos');
            esValido = false;
        }
        
        if (!datos.contraseña) {
            mostrarError('regContraseñaError', 'Contraseña es obligatoria');
            esValido = false;
        } else if (datos.contraseña.length < 6) {
            mostrarError('regContraseñaError', 'Mínimo 6 caracteres');
            esValido = false;
        } else if (!validarContraseñaSegura(datos.contraseña)) {
            mostrarError('regContraseñaError', 'Contraseña debe tener mayúsculas, minúsculas y números');
            esValido = false;
        }
        
        if (!datos.institucion || datos.institucion.length < 5) {
            mostrarError('regInstitucionError', 'Nombre de institución debe tener al menos 5 caracteres');
            esValido = false;
        } else if (!validarNombreInstitucion(datos.institucion)) {
            mostrarError('regInstitucionError', 'Nombre de institución contiene caracteres no permitidos');
            esValido = false;
        }
        
        return esValido;
    }
    
    function validarNombre(nombre) {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        return regex.test(nombre);
    }
    
    function validarEmailEducacional(email) {
        const regex = /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)+(?:edu|edu\.mx|edu\.com|gob\.mx)[^\s@]*$/i;
        return regex.test(email);
    }
    
    function validarNombreInstitucion(nombre) {
        const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.,]{5,100}$/;
        return regex.test(nombre);
    }

    // Validación en tiempo real para los campos de entrada
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validarCampoIndividual(this);
        });
        
        input.addEventListener('input', function() {
            const errorElement = document.getElementById(this.id + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
    
    function validarCampoIndividual(campo) {
        const valor = campo.value.trim();
        const errorElement = document.getElementById(campo.id + 'Error');
        
        if (!errorElement) return;
        
        let mensaje = '';
        
        switch (campo.name || campo.id) {
            case 'correo':
            case 'regCorreo':
                if (valor && !validarEmail(valor)) {
                    mensaje = 'Formato de email inválido';
                } else if (campo.name === 'correo' && valor && !validarEmailEducacional(valor)) {
                    mensaje = 'Solo se permiten correos educativos';
                }
                break;
            case 'contraseña':
            case 'regContraseña':
                if (valor && valor.length < 6) {
                    mensaje = 'Mínimo 6 caracteres';
                } else if (valor && !validarContraseñaSegura(valor)) {
                    mensaje = 'Debe tener mayúsculas, minúsculas y números';
                }
                break;
            case 'nombre':
            case 'regNombre':
                if (valor && valor.length < 3) {
                    mensaje = 'Mínimo 3 caracteres';
                } else if (valor && !validarNombre(valor)) {
                    mensaje = 'Solo letras y espacios';
                }
                break;
            case 'regInstitucion':
                if (valor && valor.length < 5) {
                    mensaje = 'Mínimo 5 caracteres';
                } else if (valor && !validarNombreInstitucion(valor)) {
                    mensaje = 'Caracteres no permitidos';
                }
                break;
        }
        
        errorElement.textContent = mensaje;
    }
    
    console.log('🚀 Sistema de login con sesiones inicializado correctamente');
});