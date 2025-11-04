const express = require('express');
const router = express.Router();
const Stop = require('../models/Stop');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validaciones
const stopValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('El nombre es requerido'),
  body('address').trim().isLength({ min: 1 }).withMessage('La dirección es requerida'),
  body('coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('estimatedArrivalTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida (formato HH:MM)'),
  body('order').isInt({ min: 0 }).withMessage('Orden inválido'),
  body('route').isMongoId().withMessage('Ruta inválida')
];

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
      .sort({ order: 1, createdAt: -1 });

    const total = await Stop.countDocuments(query);

    res.json({
      stops,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error obteniendo paradas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id)
      .populate('route', 'name code school')
      .populate('students', 'firstName lastName studentId grade');

    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }

    res.json(stop);
  } catch (error) {
    console.error('Error obteniendo parada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/', protect, stopValidation, async (req, res) => {
  try {
    const stop = new Stop(req.body);
    await stop.save();

    const populatedStop = await Stop.findById(stop._id)
      .populate('route', 'name code');

    res.status(201).json({
      message: 'Parada creada exitosamente',
      stop: populatedStop
    });
  } catch (error) {
    console.error('Error creando parada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', protect, stopValidation, async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('route', 'name code');

    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }

    res.json({
      message: 'Parada actualizada exitosamente',
      stop
    });
  } catch (error) {
    console.error('Error actualizando parada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/:id', protect, async (req, res) => {
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
  try {
    const { routeId } = req.params;
    
    const stops = await Stop.find({ route: routeId })
      .populate('students', 'firstName lastName studentId')
      .sort({ order: 1 });

    res.json(stops);
  } catch (error) {
    console.error('Error obteniendo paradas de ruta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/nearby/:lat/:lng', protect, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 1000 } = req.query; 

    const stops = await Stop.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378100]
        }
      }
    }).populate('route', 'name code');

    res.json(stops);
  } catch (error) {
    console.error('Error obteniendo paradas cercanas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;