// backend/src/config/db.js (COMPLETO Y CORREGIDO)
// (Asegúrate de que este archivo esté en 'backend/src/config/db.js')

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // CORRECCIÓN 1: Usamos MONGODB_URI (de Render) primero.
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI; 
    
    if (!uri) {
      console.error('❌ Error: MONGODB_URI o MONGO_URI no están definidas en las variables de entorno.');
      process.exit(1);
    }

    // CORRECCIÓN 2: Mongoose 7+ ya no necesita el objeto de opciones.
    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB conectado en: ${conn.connection.host}`);

  } catch (error) {
    console.error(`❌ Error conectando MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;