// backend/src/routes/auth.js (COMPLETO Y CORREGIDO)
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

// Importamos las funciones CORRECTAS del authController que arreglamos
const { register, login, getProfile } = require('../controllers/authController');

// Validación para el registro
const registerValidation = [
  body('firstName').notEmpty().withMessage('El nombre es requerido'),
  body('lastName').notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('Debe ser un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['admin', 'school_admin', 'driver', 'parent']).withMessage('Rol inválido')
];

// Validación para el login
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// --- CORRECCIÓN ---
// POST /api/auth/register
// Esta ruta debe ser PÚBLICA. No usamos 'protect' aquí.
router.post('/register', registerValidation, register);

// POST /api/auth/login
// Esta ruta también debe ser PÚBLICA.
router.post('/login', loginValidation, login);

// GET /api/auth/profile
// Esta ruta SÍ debe ser PRIVADA.
router.get('/profile', protect, getProfile);

module.exports = router;