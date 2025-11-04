const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validaciones
const userValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('role').isIn(['admin', 'driver', 'parent', 'school_admin']).withMessage('Rol inválido'),
  body('phone').optional().trim().isLength({ min: 5 }).withMessage('Teléfono inválido')
];

// Rutas
router.get('/', protect, async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .populate('assignedVehicle', 'licensePlate model brand')
      .populate('children', 'firstName lastName studentId')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedVehicle', 'licensePlate model brand color currentLocation')
      .populate('children', 'firstName lastName studentId grade school')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/', protect, userValidation, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate('assignedVehicle', 'licensePlate model brand')
      .select('-password');

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: populatedUser
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email ya existe' });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', protect, userValidation, async (req, res) => {
  try {
    // Si se está actualizando la contraseña, hashearla
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignedVehicle', 'licensePlate model brand')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/drivers/available', protect, async (req, res) => {
  try {
    const drivers = await User.find({ 
      role: 'driver',
      isActive: true,
      assignedVehicle: null 
    })
      .select('name email phone')
      .sort({ name: 1 });

    res.json(drivers);
  } catch (error) {
    console.error('Error obteniendo conductores disponibles:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;