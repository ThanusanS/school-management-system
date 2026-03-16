const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  grade: { type: String, required: true },
  section: { type: String },
  rollNumber: { type: String },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
  parentName: { type: String },
  parentPhone: { type: String },
  parentEmail: { type: String },
  bloodGroup: { type: String },
  avatar: { type: String, default: '' },
  emergencyContact: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
