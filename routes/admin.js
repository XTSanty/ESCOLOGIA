// routes/admin.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Modelo de usuario (asumiendo que tienes un modelo User)
const User = require('../models/User');

// Middleware para verificar si es admin
const isAdmin = (req, res, next) => {
    const email = req.body.email || req.query.email || req.headers.email;
    if (email === 'admin@escuela.edu.mx' || email === 'sergio.admin@escuela.edu.mx') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado: No eres administrador' });
    }
};

// Obtener todos los usuarios (solo admin)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, { contraseña: 0 }); // Excluir contraseña
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un usuario por ID (solo admin)
router.get('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { contraseña: 0 });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar usuario (solo admin)
router.put('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar usuario (solo admin)
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas (solo admin)
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            totalPosts: await mongoose.connection.collection('posts').countDocuments(),
            totalProjects: await mongoose.connection.collection('proyectos').countDocuments(),
            activeUsers: await User.countDocuments({ estado: 'activo' })
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;