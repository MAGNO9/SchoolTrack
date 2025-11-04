const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'changeme_in_prod',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

// ==========================
// Registro
// ==========================

exports.register = async (req, res) => {
  try {
    let { name, firstName, lastName, email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    if (!firstName && !lastName && name) {
      const parts = name.trim().split(' ');
      firstName = parts.shift();
      lastName = parts.join(' ');
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Usuario ya registrado' });

    // ==================
    //  INICIO DEL ARREGLO
    // ==================
    
    // NO encriptamos aquí. El modelo User.js lo hará automáticamente.
    const user = await User.create({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password: password, // <-- Pasamos la contraseña en TEXTO PLANO
      role: role || 'parent',
      isActive: true,
    });
    
    // ==================
    //   FIN DEL ARREGLO
    // ==================

    const token = signToken(user);
    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Error en registro', detail: err.message });
  }
};

// ==========================
// Login
// ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (!user.isActive) return res.status(403).json({ message: 'Usuario inactivo' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = signToken(user);
    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({ token, user: userSafe });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Error en login', detail: err.message });
  }
};

// ==========================
// Perfil
// ==========================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const userSafe = user.toObject();
    delete userSafe.password;
    res.json(userSafe);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Error al obtener perfil', detail: err.message });
  }
};

// ==========================
// Actualizar Perfil
// ==========================
exports.updateProfile = async (req, res) => {
  try {
    const { name, firstName, lastName, phone, avatar } = req.body;
    const update = { phone, avatar };

    if (name && !firstName && !lastName) {
      const parts = name.trim().split(' ');
      update.firstName = parts.shift();
      update.lastName = parts.join(' ');
    } else {
      if (firstName) update.firstName = firstName;
      if (lastName) update.lastName = lastName;
    }

    const user = await User.findByIdAndUpdate(req.user?.id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Error al actualizar perfil', detail: err.message });
  }
};
