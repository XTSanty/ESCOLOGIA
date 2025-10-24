// routes/auth.js - Rutas para autenticación CON SESIONES
const express = require('express');
const User = require('../models/User');

const router = express.Router();

// ✅ Ruta para LOGIN con sesión en MongoDB
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar que se envíen los datos necesarios
    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son obligatorios'
      });
    }

    // Buscar el usuario por correo electrónico
    const usuario = await User.findOne({ correo: correo.toLowerCase() });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Comparar la contraseña
    const contraseñaValida = await usuario.compararContraseña(contraseña);
    
    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // ✅✅✅ CREAR SESIÓN EN MONGODB ✅✅✅
    req.session.usuarioId = usuario._id;
    req.session.correo = usuario.correo;
    req.session.tipoUsuario = usuario.tipoUsuario;
    req.session.nombre = usuario.nombre;

    // Guardar sesión explícitamente
    req.session.save((err) => {
      if (err) {
        console.error('Error guardando sesión:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al crear la sesión'
        });
      }

      console.log(`✅ Sesión creada para: ${usuario.correo}`);
      
      // Login exitoso - enviar información del usuario
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        usuario: usuario.obtenerInfoPublica()
      });
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ✅ Ruta para REGISTRO (sin cambios)
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contraseña, tipoUsuario, institucion } = req.body;

    // Validar datos obligatorios
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo y contraseña son obligatorios'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ correo: correo.toLowerCase() });
    
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      correo,
      contraseña,
      tipoUsuario: tipoUsuario || 'escuela',
      institucion
    });

    // Guardar en la base de datos
    const usuarioGuardado = await nuevoUsuario.save();

    // Enviar respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: usuarioGuardado.obtenerInfoPublica()
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errores: mensajes
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ✅ NUEVA RUTA: LOGOUT (cerrar sesión)
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }
      
      res.clearCookie('connect.sid'); // Limpiar cookie de sesión
      console.log('✅ Sesión cerrada exitosamente');
      
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    });
  } else {
    res.json({
      success: true,
      message: 'No había sesión activa'
    });
  }
});

// ✅ NUEVA RUTA: Verificar sesión actual
router.get('/verificar-sesion', async (req, res) => {
  try {
    // Verificar si hay sesión activa
    if (!req.session || !req.session.usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'No hay sesión activa'
      });
    }

    // Buscar usuario en la base de datos
    const usuario = await User.findById(req.session.usuarioId);
    
    if (!usuario) {
      // Usuario no existe, destruir sesión
      req.session.destroy();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que siga activo
    if (!usuario.activo) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Sesión válida
    res.json({
      success: true,
      usuario: usuario.obtenerInfoPublica()
    });

  } catch (error) {
    console.error('Error verificando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener información del usuario (GET /api/auth/user/:id)
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuario por ID
    const usuario = await User.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Enviar información del usuario
    res.status(200).json({
      success: true,
      usuario: usuario.obtenerInfoPublica()
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ⚠️ Ruta temporal para crear admin - ELIMINAR EN PRODUCCIÓN
router.post('/create-admin', async (req, res) => {
  try {
    const admin = new User({
      nombre: 'Administrador',
      correo: 'Santy@administrator.edu.mx',
      contraseña: 'ADMINSSY98%',
      tipoUsuario: 'admin',
      institucion: 'Sistema Administrativo'
    });
    await admin.save();
    res.json({ message: 'Admin creado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;