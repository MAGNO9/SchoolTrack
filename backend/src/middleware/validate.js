// ===============================================
//   validate.js (COMPLETO Y CORREGIDO)
// ===============================================

const { validationResult } = require('express-validator');

// Esta función se queda igual
const validate = (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ success:false, message:'Error de validación', errors: errors.array().map(e=>({ field:e.param, message:e.msg, value:e.value })) });
  next();
};

// ======================================
//  INICIO DE LA CORRECCIÓN
// ======================================
// Convertimos validateObjectId en una "fábrica de middleware".
// Ahora acepta el nombre del parámetro (ej. 'studentId', 'driverId')
// y DEVUELVE la función middleware que Express usará.

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    // 1. Obtenemos el ID usando el nombre del parámetro (ej. req.params['studentId'])
    const id = req.params[paramName]; 
    
    // 2. Validamos ese ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: `ID de parámetro inválido: ${paramName}` 
      });
    }
    
    // 3. Si es válido, continuamos
    next();
  };
};
// ======================================
//  FIN DE LA CORRECCIÓN
// ======================================

// Esta función se queda igual
const validateCoordinates = (lat,lng)=>{
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if(isNaN(latitude) || latitude<-90 || latitude>90) return { valid:false, message:'Latitud inválida' };
  if(isNaN(longitude) || longitude<-180 || longitude>180) return { valid:false, message:'Longitud inválida' };
  return { valid:true };
};

module.exports = { validate, validateObjectId, validateCoordinates };