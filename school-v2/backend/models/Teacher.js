const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  subject: { type: String, required: true },
  qualification: { type: String },
  experience: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  salary: { type: Number },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  assignedClasses: [{ type: String }],
  avatar: { type: String, default: '' },
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  specialization: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
