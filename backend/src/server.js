// src/server.js
import express from 'express';
import connectDB from './config/db.js';
import Vehicle from './models/Vehicle.js';
import cors from 'cors'; // 1. AÑADIDO: Importar la librería CORS

const app = express();

// 2. AÑADIDO: Configurar Opciones CORS para permitir el origen del frontend (http://localhost:8080)
const corsOptions = {
    origin: 'http://localhost:8080', // Origen del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// 3. AÑADIDO: Usar el middleware CORS
app.use(cors(corsOptions));

app.use(express.json());

// Conectar a la base de datos
connectDB();

// Ruta para vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});