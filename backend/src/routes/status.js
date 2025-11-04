// src/routes/status.js

const express = require('express');
const router = express.Router();

// CORRECTO: El segundo argumento es una función (req, res) => { ... }
router.get('/', (req, res) => {
  
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente 🚀',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() // Tiempo que el servidor lleva activo
  });

});

module.exports = router;