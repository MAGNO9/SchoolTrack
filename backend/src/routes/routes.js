const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validaciones
const routeValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('El nombre es requerido'),
  body('code').trim().isLength({ min: 1 }).withMessage('El código es requerido'),
  body('school.name').trim().isLength({ min: 1 }).withMessage('El nombre de la escuela es requerido'),
  body('school.address').trim().isLength({ min: 1 }).withMessage('La dirección de la escuela es requerida'),
  body('school.coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitud de escuela inválida'),
  body('school.coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitud de escuela inválida')
];

// Rutas
router.get('/', protect, routeController.getAllRoutes);
router.get('/active', protect, routeController.getActiveRoutes);
router.get('/:id', protect, routeController.getRouteById);
router.post('/', protect, routeValidation, routeController.createRoute);
router.put('/:id', protect, routeValidation, routeController.updateRoute);
router.delete('/:id', protect, routeController.deleteRoute);
router.post('/:id/assign-vehicle', protect, routeController.assignVehicle);
router.delete('/:id/remove-vehicle', protect, routeController.removeVehicle);

module.exports = router;