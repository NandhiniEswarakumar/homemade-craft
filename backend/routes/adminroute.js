const express = require('express');
const router = express.Router();
const User = require('../models/User');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password === ADMIN_PASSWORD) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

router.get('/user-logins', adminAuth, async (req, res) => {
  const users = await User.find({}, 'email loginHistory');
  res.json(users);
});

module.exports = router;