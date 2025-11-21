// backend/src/routes/users.js (COMPLETO Y CORREGIDO)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const fs = require('fs');
const path = require('path');
// --- CORRECCIÓN 1: Importar authorize ---
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator'); 

// --- CORRECCIÓN 2: Validar firstName y lastName ---
const userValidation = [
  body('firstName').trim().notEmpty().withMessage('El nombre es requerido'),
  body('lastName').trim().notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('role').isIn(['admin', 'driver', 'parent', 'school_admin']).withMessage('Rol inválido'),
  body('phone').optional().trim().isLength({ min: 5 }).withMessage('Teléfono inválido')
];

// --- CORRECCIÓN 3: Definir roles de admin ---
const adminRoles = ['admin', 'school_admin'];

// --- CORRECCIÓN 4: Añadir authorize a las rutas ---
router.get('/', protect, authorize(adminRoles), async (req, res) => {
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
    res.json({ users, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', protect, authorize(adminRoles), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedVehicle', 'licensePlate model brand')
      .populate('children', 'firstName lastName studentId')
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

router.put('/:id', protect, authorize(adminRoles), userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updateData = req.body;
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Solo el 'admin' principal puede borrar
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar avatar físico si existe
    try {
      if (user.avatar) {
        const uploadDir = path.join(__dirname, '../uploads');
        const filePath = path.join(uploadDir, 'avatars', user.avatar);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fsErr) {
      console.error('Error eliminando avatar del usuario:', fsErr);
      // No interrumpir la eliminación del usuario por fallo al borrar fichero
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/drivers/available', protect, authorize(adminRoles), async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true })
      .select('firstName lastName email phone')
      .sort({ lastName: 1 });
    res.json(drivers);
  } catch (error) {
    console.error('Error obteniendo conductores disponibles:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;