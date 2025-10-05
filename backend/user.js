const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLoginAt: Date,
  lastLogoutAt: Date,
  loginCount: { type: Number, default: 0 },
  loginHistory: [
    {
      loginAt: { type: Date, required: true },
      logoutAt: Date,
      ipAddress: String,
      userAgent: String,
      sessionDuration: Number // in minutes
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

