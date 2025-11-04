const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const { protect } = require('../middleware/authMiddleware');
const { query } = require('express-validator');

// Validaciones
const locationHistoryValidation = [
  query('vehicleId').isMongoId().withMessage('ID de vehículo inválido'),
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio inválida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin inválida'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Límite inválido')
];

const etaValidation = [
  query('vehicleId').isMongoId().withMessage('ID de vehículo inválido'),
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
];

const areaValidation = [
  query('north').isFloat().withMessage('Límite norte inválido'),
  query('south').isFloat().withMessage('Límite sur inválido'),
  query('east').isFloat().withMessage('Límite este inválido'),
  query('west').isFloat().withMessage('Límite oeste inválido')
];

// Rutas
router.get('/history', protect, locationHistoryValidation, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, limit } = req.query;
    
    const history = await locationService.getVehicleLocationHistory(vehicleId, {
      startDate,
      endDate,
      limit: parseInt(limit) || 100
    });

    res.json({ history });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/eta', protect, etaValidation, async (req, res) => {
  try {
    const { vehicleId, lat, lon } = req.query;
    
    const eta = await locationService.calculateVehicleETA(vehicleId, {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon)
    });

    res.json(eta);
  } catch (error) {
    console.error('Error calculando ETA:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/route/:routeId', protect, async (req, res) => {
  try {
    const { routeId } = req.params;
    const vehicles = await locationService.getRouteVehicleLocations(routeId);
    
    res.json({ routeId, vehicles });
  } catch (error) {
    console.error('Error obteniendo ubicaciones de ruta:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/area', protect, areaValidation, async (req, res) => {
  try {
    const bounds = {
      north: parseFloat(req.query.north),
      south: parseFloat(req.query.south),
      east: parseFloat(req.query.east),
      west: parseFloat(req.query.west)
    };

    const vehicles = await locationService.getActiveVehiclesInArea(bounds);
    res.json({ vehicles });
  } catch (error) {
    console.error('Error obteniendo vehículos en área:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;