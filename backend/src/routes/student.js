// src/routes/student.js
const express = require('express');
const router = express.Router();
const { createStudent, getMyStudents, getStudentById } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 

router.route('/')
  .post(createStudent)
  .get(getMyStudents);

router.route('/:id')
  .get(getStudentById);

module.exports = router;