import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'driver', 'parent', 'school_admin', 'student'], default: 'parent' },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  profile: {
    driver: {
      licenseNumber: { type: String },
      licenseExpiry: { type: Date },
      experience: { type: Number },
      vehicleType: { type: String },
      certifications: [{ type: String }],
      emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
      }
    },

    parent: {
      children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
      preferredContactMethod: { type: String, enum: ['email', 'sms', 'push'], default: 'push' },
      notificationSettings: {
        pickup: { type: Boolean, default: true },
        dropoff: { type: Boolean, default: true },
        delays: { type: Boolean, default: true },
        emergencies: { type: Boolean, default: true },
        dailySummary: { type: Boolean, default: false }
      }
    },

    student: {
      studentId: { type: String },
      grade: { type: String },
      school: { type: String },
      dateOfBirth: { type: Date },
      emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
      },
      medicalInfo: {
        allergies: [{ type: String }],
        medications: [{ type: String }],
        specialNeeds: { type: String },
        bloodType: { type: String }
      },
      qrCode: { type: String, unique: true, sparse: true },
      currentStatus: {
        status: { type: String, enum: ['home','school','transport','unknown'], default: 'unknown' },
        lastUpdate: { type: Date },
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    },

    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    assignedSchool: { type: String },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      timestamp: { type: Date },
      accuracy: { type: Number, default: 10 }
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    notificationSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true }
    },

    devices: [{
      token: { type: String },
      type: { type: String, enum: ['web','ios','android'] },
      name: { type: String },
      lastUsed: { type: Date },
      isActive: { type: Boolean, default: true }
    }],

    sessions: [{
      token: { type: String },
      device: { type: String },
      ip: { type: String },
      userAgent: { type: String },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) },
      isActive: { type: Boolean, default: true }
    }],

    activityLog: [{
      action: { type: String },
      description: { type: String, default: '' },
      ip: { type: String },
      userAgent: { type: String },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }]
  }
}, { timestamps: true });

// Virtual para compatibilidad 'name'
userSchema.virtual('name').get(function() {
  return [this.firstName, this.lastName].filter(Boolean).join(' ');
});

// Hooks y métodos
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateStudentQRCode = function() {
  const crypto = require('crypto');
  return 'STU_' + crypto.randomBytes(8).toString('hex');
};

userSchema.methods.updateLocation = function(lat, lng, accuracy = 10) {
  this.profile.currentLocation = { latitude: lat, longitude: lng, timestamp: new Date(), accuracy };
  this.profile.lastSeen = new Date();
  return this.save();
};

userSchema.methods.logActivity = function(action, description = '', metadata = {}, req = null) {
  const activity = { action, description, timestamp: new Date(), metadata };
  if (req) { activity.ip = req.ip; activity.userAgent = req.get('User-Agent'); }
  this.profile.activityLog.unshift(activity);
  if (this.profile.activityLog.length > 100) this.profile.activityLog = this.profile.activityLog.slice(0,100);
  return this.save();
};

userSchema.methods.addDevice = function(token, type, name) {
  this.profile.devices.forEach(d => { if (d.type===type && d.isActive) d.isActive=false; });
  this.profile.devices.push({ token, type, name, lastUsed: new Date(), isActive: true });
  return this.save();
};

userSchema.methods.createSession = function(token, device, req = null) {
  const session = { token, device, createdAt: new Date(), expiresAt: new Date(Date.now()+7*24*60*60*1000), isActive: true };
  if (req) { session.ip = req.ip; session.userAgent = req.get('User-Agent'); }
  this.profile.sessions.push(session);
  this.profile.sessions = this.profile.sessions.filter(s => s.isActive && s.expiresAt>new Date());
  return this.save();
};

userSchema.methods.getPublicProfile = function() {
  const u = this.toObject();
  delete u.password; delete u.sessions; delete u.devices;
  if (this.role==='student'){ delete u.profile.parent; delete u.profile.driver; }
  if (this.role==='parent'){ delete u.profile.driver; delete u.profile.student; }
  if (this.role==='driver'){ delete u.profile.parent; delete u.profile.student; }
  return u;
};

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'profile.student.qrCode': 1 });
userSchema.index({ 'profile.assignedVehicle': 1 });
userSchema.index({ 'profile.assignedRoute': 1 });

export default mongoose.model('User', userSchema);