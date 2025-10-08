// server.js - Servidor principal de la aplicación
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Carga las variables de entorno

// Importar rutas
const authRoutes = require('./routes/auth');

// Crear la aplicación de Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Permite peticiones desde cualquier origen
app.use(express.json()); // Para parsear JSON en las peticiones
app.use(express.urlencoded({ extended: true })); // Para formularios

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
const connectDB = async () => {
  try {
    // URL de conexión - usar variable de entorno en producción
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ods-school-platform';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado exitosamente a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1); // Termina la aplicación si no puede conectar
  }
};

// Conectar a la base de datos
connectDB();

// Rutas de la API
app.use('/api/auth', authRoutes); // Rutas de autenticación

// Ruta para servir la página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para páginas no encontradas
app.get('*', (req, res) => {
  res.status(404).send(`
    <h1>Página no encontrada</h1>
    <p>La página que buscas no existe.</p>
    <a href="/">Volver al inicio</a>
  `);
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos desde: ${path.join(__dirname, 'public')}`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada.');
  process.exit(0);
});