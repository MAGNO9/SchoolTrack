const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getAllVehicles = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const vehicles = await Vehicle.find(query)
      .populate('driver', 'name email phone')
      .populate('assignedRoute', 'name code')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);

    res.json({
      vehicles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('driver', 'name email phone avatar')
      .populate('assignedRoute', 'name code school');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error obteniendo vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicleData = req.body;
    
    // Verificar que el conductor existe y tiene el rol apropiado
    const driver = await User.findById(vehicleData.driver);
    if (!driver) {
      return res.status(400).json({ message: 'Conductor no encontrado' });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({ message: 'El usuario debe ser un conductor' });
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Actualizar el conductor con el vehículo asignado
    await User.findByIdAndUpdate(vehicleData.driver, {
      assignedVehicle: vehicle._id
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('driver', 'name email phone');

    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      vehicle: populatedVehicle
    });
  } catch (error) {
    console.error('Error creando vehículo:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'La placa ya existe' });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicleData = req.body;
    
    // Si se está cambiando el conductor, verificar que existe
    if (vehicleData.driver) {
      const driver = await User.findById(vehicleData.driver);
      if (!driver || driver.role !== 'driver') {
        return res.status(400).json({ message: 'Conductor inválido' });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      vehicleData,
      { new: true, runValidators: true }
    ).populate('driver', 'name email phone');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.json({
      message: 'Vehículo actualizado exitosamente',
      vehicle
    });
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Remover la asignación del conductor
    await User.findByIdAndUpdate(vehicle.driver, {
      assignedVehicle: null
    });

    res.json({ message: 'Vehículo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        'currentLocation.latitude': latitude,
        'currentLocation.longitude': longitude,
        'currentLocation.timestamp': new Date()
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.json({
      message: 'Ubicación actualizada exitosamente',
      vehicle
    });
  } catch (error) {
    console.error('Error actualizando ubicación:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getVehiclesNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radio en metros
    
    const vehicles = await Vehicle.find({
      'currentLocation': {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radius / 6378100]
        }
      },
      status: 'active'
    }).populate('driver', 'name email phone');

    res.json(vehicles);
  } catch (error) {
    console.error('Error obteniendo vehículos cercanos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};