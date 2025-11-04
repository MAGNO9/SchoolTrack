const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validaciones
const vehicleValidation = [
  body('licensePlate').trim().isLength({ min: 3 }).withMessage('La placa es requerida'),
  body('model').trim().isLength({ min: 1 }).withMessage('El modelo es requerido'),
  body('brand').trim().isLength({ min: 1 }).withMessage('La marca es requerida'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Año inválido'),
  body('color').trim().isLength({ min: 1 }).withMessage('El color es requerido'),
  body('capacity').isInt({ min: 1, max: 100 }).withMessage('Capacidad inválida'),
  body('driver').isMongoId().withMessage('Conductor inválido')
];

const locationValidation = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
];

// Rutas
router.get('/', protect, vehicleController.getAllVehicles);
router.get('/nearby', protect, vehicleController.getVehiclesNearLocation);
router.get('/:id', protect, vehicleController.getVehicleById);
router.post('/', protect, vehicleValidation, vehicleController.createVehicle);
router.put('/:id', protect, vehicleValidation, vehicleController.updateVehicle);
router.delete('/:id', protect, vehicleController.deleteVehicle);
router.put('/:id/location', protect, locationValidation, vehicleController.updateLocation);

module.exports = router;