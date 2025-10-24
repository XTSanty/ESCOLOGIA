// routes/reportes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Middleware para verificar si es admin (opcional, dependiendo de tu seguridad)
const isAdmin = (req, res, next) => {
    // Aquí puedes implementar tu lógica de verificación de admin
    // Por ahora, permitimos acceso a todos para pruebas
    next();
};

// Obtener estadísticas generales
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const stats = {
            totalProyectos: await mongoose.connection.collection('proyectos').countDocuments(),
            proyectosActivos: await mongoose.connection.collection('proyectos').countDocuments({ estado: 'pendiente' }),
            proyectosTerminados: await mongoose.connection.collection('proyectos').countDocuments({ estado: 'terminado' }),
            totalUsuarios: await mongoose.connection.collection('users').countDocuments(),
            totalPosts: await mongoose.connection.collection('posts').countDocuments()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener datos para gráficos
router.get('/charts', isAdmin, async (req, res) => {
    try {
        // Datos para gráficos (puedes personalizar según tus necesidades)
        const proyectos = await mongoose.connection.collection('proyectos').find({}).toArray();
        const posts = await mongoose.connection.collection('posts').find({}).toArray();
        const users = await mongoose.connection.collection('users').find({}).toArray();

        res.json({
            proyectos,
            posts,
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Exportar datos a Excel (simulado)
router.get('/export-excel', isAdmin, async (req, res) => {
    try {
        // Aquí iría la lógica para generar el archivo Excel
        // Por ahora, devolvemos un mensaje de éxito
        res.json({ 
            success: true, 
            message: 'Archivo Excel generado exitosamente',
            filename: 'reportes_' + new Date().toISOString().split('T')[0] + '.xlsx'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;