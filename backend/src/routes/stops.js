// backend/src/routes/stops.js (COMPLETO Y CORREGIDO)
const express = require('express');
const router = express.Router();
const Stop = require('../models/Stop');
// --- CORRECCIÓN 1: Importar authorize ---
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Validaciones
const stopValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('El nombre es requerido'),
  body('address').trim().isLength({ min: 1 }).withMessage('La dirección es requerida'),
  // --- CORRECCIÓN 2: Validar Coordenadas GeoJSON [Lng, Lat] ---
  body('coordinates.coordinates.0').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('coordinates.coordinates.1').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('estimatedArrivalTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida (formato HH:MM)'),
  body('order').isInt({ min: 0 }).withMessage('Orden inválido'),
  body('route').isMongoId().withMessage('Ruta inválida')
];

// --- CORRECCIÓN 3: Definir roles de admin ---
const adminRoles = ['admin', 'school_admin'];

// Rutas
router.get('/', protect, async (req, res) => {
  try {
    const { route, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (route) query.route = route;
    if (status) query.status = status;

    const stops = await Stop.find(query)
      .populate('route', 'name code')
      .populate('students', 'firstName lastName studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ order: 1 });
      
    const total = await Stop.countDocuments(query);
    res.json({ stops, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    console.error('Error obteniendo paradas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const stop = await Stop.findById(req.params.id).populate('route', 'name code');
        if (!stop) {
            return res.status(404).json({ message: 'Parada no encontrada' });
        }
        res.json(stop);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// --- CORRECCIÓN 4: Añadir authorize a rutas de escritura ---
router.post('/', protect, authorize(adminRoles), stopValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const stop = new Stop(req.body);
    await stop.save();
    res.status(201).json(stop);
  } catch (error) {
    console.error('Error creando parada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', protect, authorize(adminRoles), stopValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    res.json(stop);
  } catch (error) {
    console.error('Error actualizando parada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/:id', protect, authorize(adminRoles), async (req, res) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);
    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    res.json({ message: 'Parada eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando parada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/route/:routeId', protect, async (req, res) => {
  // ... (tu código) ...
});

router.get('/nearby/:lat/:lng', protect, async (req, res) => {
  // ... (tu código) ...
});

module.exports = router;