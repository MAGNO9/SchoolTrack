import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Middleware para manejar errores de validación
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(e => ({
        field: e.param,
        message: e.msg,
        value: e.value
      }))
    });
  }
  
  next();
};

/**
 * Validar ObjectId de MongoDB
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `ID inválido: ${paramName}`
      });
    }

    next();
  };
};

/**
 * Validar coordenadas (latitud y longitud)
 */
export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return {
      valid: false,
      message: 'Latitud inválida (debe estar entre -90 y 90)'
    };
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return {
      valid: false,
      message: 'Longitud inválida (debe estar entre -180 y 180)'
    };
  }

  return { valid: true };
};

/**
 * Validar formato de email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar teléfono
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\-+\s()]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validar rango de edad
 */
export const validateAge = (dateOfBirth, minAge = 0, maxAge = 120) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= minAge && age <= maxAge;
};

export default {
  validate,
  validateObjectId,
  validateCoordinates,
  validateEmail,
  validatePhone,
  validateAge
};