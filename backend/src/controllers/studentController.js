// src/controllers/studentController.js
const Student = require('../models/Student');
const User = require('../models/User');

exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, grade, medicalInfo, emergencyContact } = req.body;
    const parentId = req.user.id; 

    const student = await Student.create({
      firstName,
      lastName,
      parent: parentId,
      dateOfBirth,
      grade,
      medicalInfo,
      emergencyContact
    });

    await User.findByIdAndUpdate(parentId, { 
      $push: { 'profile.parent.children': student._id } 
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error('Error creando estudiante:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

exports.getMyStudents = async (req, res) => {
  try {
    const students = await Student.find({ parent: req.user.id });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(4404).json({ message: 'Estudiante no encontrado' });
    }
    if (student.parent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', detail: error.message });
  }
};