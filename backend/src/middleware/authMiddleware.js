const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Leer el token del header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Obtener el token (sin el "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme_in_prod');

      // 4. Obtener el usuario del token y adjuntarlo a 'req'
      // Excluimos el password del objeto que adjuntamos
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }

      next(); // Continuar al siguiente middleware/controlador
    } catch (error) {
      console.error('Error de autenticación:', error.message);
      return res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token faltante' });
  }
};

// Opcional: Middleware para restringir por rol
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso prohibido: Rol no autorizado' });
    }
    next();
  };
};

module.exports = { protect, authorize };