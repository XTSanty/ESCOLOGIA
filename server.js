// server.js - Configuración de sesión CORREGIDA para persistir

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configurado correctamente
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB ANTES de configurar sesiones
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ods-school-platform';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado exitosamente a MongoDB');
    console.log('📍 URI:', mongoURI);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// ✅✅✅ CONFIGURACIÓN DE SESIÓN MEJORADA ✅✅✅
app.use(session({
  name: 'ods.session.id', // Nombre personalizado de la cookie
  secret: process.env.SESSION_SECRET || 'ods-platform-secret-key-2024-super-seguro',
  resave: false,
  saveUninitialized: false,
  
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ods-school-platform',
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 días en segundos (en lugar de 1)
    autoRemove: 'native', // MongoDB elimina sesiones expiradas automáticamente
    touchAfter: 24 * 3600 // Actualizar sesión cada 24 horas
  }),
  
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días en milisegundos
    httpOnly: true,
    secure: false, // true en producción con HTTPS
    sameSite: 'lax',
    path: '/' // Asegurar que funcione en todas las rutas
  },
  
  // Regenerar ID de sesión en cada login (seguridad)
  rolling: false, // No resetear maxAge en cada request
}));

// ✅ MIDDLEWARE DE DEBUG (temporal - para ver qué pasa)
app.use((req, res, next) => {
  console.log('📍 Ruta:', req.method, req.path);
  console.log('🔑 Session ID:', req.sessionID);
  console.log('👤 Usuario en sesión:', req.session?.usuarioId || 'No hay sesión');
  console.log('🍪 Cookies:', req.headers.cookie);
  console.log('---');
  next();
});

// ✅ MIDDLEWARE MEJORADO de verificación
function verificarAutenticacion(req, res, next) {
  console.log('🔒 Verificando autenticación para:', req.path);
  console.log('Session:', req.session);
  
  if (req.session && req.session.usuarioId) {
    console.log('✅ Sesión válida para usuario:', req.session.usuarioId);
    next();
  } else {
    console.log('❌ No hay sesión válida, redirigiendo a login');
    res.redirect('/');
  }
}

// Importar rutas
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const proyectoRoutes = require('./routes/proyectos');
const perfilRoutes = require('./routes/perfil');
const adminRoutes = require('./routes/admin');
const reportesRoutes = require('./routes/reportes');

app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de login (SIN protección)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ✅ RUTAS PWA - Añadidas aquí
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/public/Images/:imageName', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Images', req.params.imageName));
});

// ✅ RUTAS PROTEGIDAS
app.get('/home', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/home.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/foro', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'foro.html'));
});

app.get('/foro.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'foro.html'));
});

app.get('/foros-chat', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'foro.html'));
});

app.get('/foros-chat.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'foro.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

app.get('/registro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

app.get('/perfil-escuela', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'perfil-escuela.html'));
});

app.get('/perfil-escuela.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'perfil-escuela.html'));
});

app.get('/mapa-colaborativo', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mapa-colaborativo.html'));
});

app.get('/mapa-colaborativo.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mapa-colaborativo.html'));
});

app.get('/publicacion-proyectos', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'publicacion-proyectos.html'));
});

app.get('/publicacion-proyectos.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'publicacion-proyectos.html'));
});

app.get('/monitoreo-iot', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'monitoreo-iot.html'));
});

app.get('/monitoreo-iot.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'monitoreo-iot.html'));
});

app.get('/panel-administrativo', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panel-administrativo.html'));
});

app.get('/panel-administrativo.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panel-administrativo.html'));
});

app.get('/reportes', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reportes.html'));
});

app.get('/reportes.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reportes.html'));
});

app.get('/juegos', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'juegos.html'));
});

app.get('/juegos.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'juegos.html'));
});

app.get('*', (req, res) => {
  res.status(404).send(`
    <h1>Página no encontrada</h1>
    <p>La página que buscas no existe.</p>
    <a href="/">Volver al inicio</a>
  `);
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos desde: ${path.join(__dirname, 'public')}`);
  console.log(`🔒 Sesiones guardándose en MongoDB (colección: sessions)`);
  console.log(`⏰ Duración de sesión: 7 días`);
});

process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada.');
  process.exit(0);
});