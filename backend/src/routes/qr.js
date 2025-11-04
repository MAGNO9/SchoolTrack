const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validate');

// Generar código QR para estudiante
router.post('/student/:studentId/generate', 
  protect,
  authorize('admin', 'school_admin'),
  validateObjectId('studentId'),
  qrController.generateStudentQR
);

// Generar código QR para conductor
router.post('/driver/:driverId/generate', 
  protect,
  authorize('admin', 'school_admin'),
  validateObjectId('driverId'),
  qrController.generateDriverQR
);

// Escanear código QR de estudiante
router.post('/student/scan', 
  protect,
  authorize('driver'),
  qrController.scanStudentQR
);

// Escanear código QR de conductor
router.post('/driver/scan', 
  protect,
  authorize('driver'),
  qrController.scanDriverQR
);

// Obtener estudiantes en un vehículo
router.get('/vehicle/:vehicleId/students', 
  protect,
  authorize('admin', 'school_admin', 'driver'),
  validateObjectId('vehicleId'),
  qrController.getStudentsInVehicle
);

module.exports = router;