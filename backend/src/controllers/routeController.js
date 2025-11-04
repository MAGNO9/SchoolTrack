const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Vehicle = require('../models/Vehicle');
const { validationResult } = require('express-validator');
const routeService = require('../services/routeService');

exports.getAllRoutes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const routes = await Route.find(query)
      .populate('stops.stop', 'name address coordinates')
      .populate('assignedVehicles', 'licensePlate model brand')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Route.countDocuments(query);

    res.json({
      routes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error obteniendo rutas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate({
        path: 'stops.stop',
        populate: {
          path: 'students',
          select: 'firstName lastName studentId'
        }
      })
      .populate('assignedVehicles', 'licensePlate model brand color currentLocation')
      .populate('createdBy', 'name email');

    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error obteniendo ruta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const routeData = req.body;
    routeData.createdBy = req.user.userId;

    // Si hay paradas, calcular la geometría de la ruta
    if (routeData.stops && routeData.stops.length > 0) {
      const coordinates = await routeService.calculateRouteGeometry(routeData.stops);
      routeData.geometry = {
        type: 'LineString',
        coordinates: coordinates
      };
    }

    const route = new Route(routeData);
    await route.save();

    const populatedRoute = await Route.findById(route._id)
      .populate('stops.stop', 'name address coordinates')
      .populate('assignedVehicles', 'licensePlate model brand')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Ruta creada exitosamente',
      route: populatedRoute
    });
  } catch (error) {
    console.error('Error creando ruta:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El código de ruta ya existe' });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const routeData = req.body;
    
    // Si se actualizan las paradas, recalcular la geometría
    if (routeData.stops) {
      const coordinates = await routeService.calculateRouteGeometry(routeData.stops);
      routeData.geometry = {
        type: 'LineString',
        coordinates: coordinates
      };
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      routeData,
      { new: true, runValidators: true }
    )
      .populate('stops.stop', 'name address coordinates')
      .populate('assignedVehicles', 'licensePlate model brand')
      .populate('createdBy', 'name email');

    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    res.json({
      message: 'Ruta actualizada exitosamente',
      route
    });
  } catch (error) {
    console.error('Error actualizando ruta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    // Limpiar referencias en vehículos
    await Vehicle.updateMany(
      { assignedRoute: route._id },
      { assignedRoute: null }
    );

    res.json({ message: 'Ruta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando ruta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.assignVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    // Verificar que el vehículo existe
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Verificar que la ruta existe
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    // Asignar vehículo a la ruta
    if (!route.assignedVehicles.includes(vehicleId)) {
      route.assignedVehicles.push(vehicleId);
      await route.save();
    }

    // Asignar ruta al vehículo
    vehicle.assignedRoute = route._id;
    await vehicle.save();

    const updatedRoute = await Route.findById(route._id)
      .populate('assignedVehicles', 'licensePlate model brand color');

    res.json({
      message: 'Vehículo asignado exitosamente',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Error asignando vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.removeVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    // Remover vehículo de la ruta
    route.assignedVehicles = route.assignedVehicles.filter(
      vehicle => vehicle.toString() !== vehicleId
    );
    await route.save();

    // Remover asignación del vehículo
    await Vehicle.findByIdAndUpdate(vehicleId, {
      assignedRoute: null
    });

    res.json({ message: 'Vehículo removido exitosamente' });
  } catch (error) {
    console.error('Error removiendo vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getActiveRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ status: 'active' })
      .populate('assignedVehicles', 'licensePlate model brand currentLocation')
      .populate('stops.stop', 'name coordinates');

    res.json(routes);
  } catch (error) {
    console.error('Error obteniendo rutas activas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};