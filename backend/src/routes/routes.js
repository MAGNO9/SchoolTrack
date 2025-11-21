// backend/src/routes/routes.js (COMPLETO Y CORREGIDO)
const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
// --- CORRECCIÓN 1: Importar authorize ---
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validaciones
const routeValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('El nombre es requerido'),
  body('code').trim().isLength({ min: 1 }).withMessage('El código es requerido'),
  body('school.name').trim().isLength({ min: 1 }).withMessage('El nombre de la escuela es requerido'),
  body('school.address').trim().isLength({ min: 1 }).withMessage('La dirección de la escuela es requerida'),
  // --- CORRECCIÓN 2: Validar Coordenadas GeoJSON [Lng, Lat] ---
  body('school.coordinates.coordinates.0').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('school.coordinates.coordinates.1').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida')
];

// --- CORRECCIÓN 3: Definir roles de admin ---
const adminRoles = ['admin', 'school_admin'];

// Rutas
router.get('/', protect, routeController.getAllRoutes);
router.get('/active', protect, routeController.getActiveRoutes);
router.get('/:id', protect, routeController.getRouteById);

// --- CORRECCIÓN 4: Añadir authorize a rutas de escritura ---
router.post('/', protect, authorize(adminRoles), routeValidation, routeController.createRoute);
router.put('/:id', protect, authorize(adminRoles), routeValidation, routeController.updateRoute);
router.delete('/:id', protect, authorize(adminRoles), routeController.deleteRoute);
router.post('/:id/assign-vehicle', protect, authorize(adminRoles), routeController.assignVehicle);
router.delete('/:id/remove-vehicle', protect, authorize(adminRoles), routeController.removeVehicle);

module.exports = router;