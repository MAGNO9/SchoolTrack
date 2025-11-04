import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedSchool: { type: String, trim: true },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  studentId: { type: String, unique: true, sparse: true },
  grade: { type: String },
  dateOfBirth: { type: Date },
  avatar: { type: String, default: '' },
  qrCode: { type: String, unique: true, sparse: true },
  medicalInfo: {
    allergies: [{ type: String }],
    medications: [{ type: String }],
    specialNeeds: { type: String },
    bloodType: { type: String }
  },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  currentStatus: {
    status: { 
      type: String, 
      enum: ['home', 'school', 'transport', 'absent', 'unknown'], 
      default: 'unknown' 
    },
    lastUpdate: { type: Date },
    lastSeenAt: { type: String }
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

studentSchema.pre('save', function(next) {
  if (!this.studentId) {
    this.studentId = `STU-${Date.now().toString().slice(-6)}`;
  }
  if (!this.qrCode) {
    this.qrCode = `SCHTRK_STU_${this._id.toString()}`;
  }
  next();
});

export default mongoose.model('Student', studentSchema);