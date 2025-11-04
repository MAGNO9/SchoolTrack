import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true, trim: true },
  model: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1990, max: new Date().getFullYear() + 1 },
  color: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1, max: 100 },
  fuelType: { type: String, enum: ['gasoline', 'diesel', 'electric', 'hybrid'], default: 'gasoline' },
  status: { type: String, enum: ['active', 'maintenance', 'inactive', 'out_of_service'], default: 'active' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, default: [0, 0] }, // [lon, lat]
    timestamp: { type: Date, default: Date.now }
  },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  features: [{ type: String, enum: ['ac', 'heating', 'wifi', 'camera', 'gps', 'first_aid'] }],
  lastMaintenance: { date: Date, description: String, nextDue: Date },
  insurance: { company: String, policyNumber: String, expiryDate: Date },
  odometer: { type: Number, min: 0 },
  vin: { type: String, trim: true }
}, { timestamps: true });

// Índice geoespacial
vehicleSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Vehicle', vehicleSchema);