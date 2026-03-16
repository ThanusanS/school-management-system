const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'admin' },
  avatar: { type: String, default: '' },
  phone: { type: String },
  address: { type: String },
  // Reference to student/teacher profile
  profileId: { type: mongoose.Schema.Types.ObjectId, refPath: 'role' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
