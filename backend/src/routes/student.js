// backend/src/routes/student.js (COMPLETO Y CORREGIDO)
const express = require('express');
const router = express.Router();
const { 
  createStudent, 
  getMyStudents,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const adminRoles = ['admin', 'school_admin'];
const parentRole = ['parent'];
const allRoles = ['admin', 'school_admin', 'parent']; // Roles que pueden crear

// Todas las rutas requieren estar logueado
router.use(protect); 

// --- RUTAS DE ADMIN ---
// GET /api/students (Ruta principal ahora es para Admins)
router.get('/', authorize(adminRoles), getAllStudents);

// --- RUTAS DE PADRE ---
// GET /api/students/my (Un padre ve SOLO sus hijos)
router.get('/my', authorize(parentRole), getMyStudents);

// --- RUTA DE CREACIÓN ---
// (Admins y Padres pueden crear)
router.post('/', authorize(allRoles), createStudent); 

// --- RUTAS DE GESTIÓN POR ID ---
// (Arregla el TypeError)
router.route('/:id')
  .get(authorize(allRoles), getStudentById) // Un padre puede ver a su hijo, un admin puede ver a todos
  .put(authorize(adminRoles), updateStudent) // Solo admins modifican
  .delete(authorize(adminRoles), deleteStudent); // Solo admins eliminan

module.exports = router;