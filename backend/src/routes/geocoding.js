const express = require('express');
const router = express.Router();
const geocodingService = require('../services/geocodingService');
const { protect } = require('../middleware/authMiddleware');
const { body, query } = require('express-validator');

// Validaciones
const geocodeValidation = [
  body('address').trim().isLength({ min: 1 }).withMessage('La dirección es requerida')
];

const reverseGeocodeValidation = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
];

// Rutas
router.post('/geocode', protect, geocodeValidation, async (req, res) => {
  try {
    const { address } = req.body;
    const result = await geocodingService.geocodeAddress(address);
    res.json(result);
  } catch (error) {
    console.error('Error en geocodificación:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/reverse-geocode', protect, reverseGeocodeValidation, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const result = await geocodingService.reverseGeocode(parseFloat(lat), parseFloat(lon));
    res.json(result);
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/batch-geocode', protect, async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de direcciones' });
    }

    if (addresses.length > 50) {
      return res.status(400).json({ message: 'Máximo 50 direcciones por solicitud' });
    }

    const results = await geocodingService.batchGeocode(addresses);
    res.json({ results });
  } catch (error) {
    console.error('Error en geocodificación por lotes:', error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/format-address', protect, async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ message: 'La dirección es requerida' });
    }

    const result = await geocodingService.geocodeAddress(address);
    const formattedAddress = geocodingService.formatAddress(result.address);
    
    res.json({
      formattedAddress,
      original: result
    });
  } catch (error) {
    console.error('Error formateando dirección:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;