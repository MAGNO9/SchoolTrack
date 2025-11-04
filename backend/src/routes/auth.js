const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // <-- IMPORTANTE: Importa el guardián

// Rutas públicas (no requieren token)
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren token)
// 'protect' se ejecutará ANTES que 'getProfile'
router.get('/profile', protect, getProfile); 
router.put('/profile', protect, updateProfile);

// Ejemplo de ruta solo para 'admin'
// router.get('/admin-only', protect, authorize('admin'), (req, res) => {
//   res.json({ message: 'Bienvenido, Admin!' });
// });

module.exports = router;