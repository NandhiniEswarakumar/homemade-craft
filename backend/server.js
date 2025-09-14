const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5001; // Change 5000 to 5001 or any free port

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftsale')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Extend user schema for reset token and expiry
if (!userSchema.paths.resetPasswordToken) {
  userSchema.add({
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  });
}

const User = mongoose.model('User', userSchema);

// Routes

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    console.log('Signup request body:', req.body); // Debug log

    const { username, email, mobile, address, password } = req.body;

    // Check for missing fields
    if (!username || !email || !mobile || !address || !password) {
      console.log('Signup error: Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Signup error: User with this email already exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      mobile,
      address,
      password: hashedPassword
    });

    await newUser.save();
    console.log('User created successfully:', newUser.email);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    // Improved error logging
    if (error.name === 'ValidationError') {
      console.log('Signup error: ValidationError', error.message);
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      console.log('Signup error: Duplicate email');
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body); // Debug log

    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
      console.log('Login error: Missing fields');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login error: User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Login error: Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }

    console.log('Login successful for:', user.email);
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Logout endpoint (stateless, for frontend to clear token/localStorage)
app.post('/api/logout', (req, res) => {
  // No server-side session to destroy, just respond OK
  res.json({ message: 'Logged out successfully' });
});

// Reset Password endpoint
app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }

  const saltRounds = 10;
  user.password = await bcrypt.hash(password, saltRounds);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully." });
});

// Forgot Password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If this email exists, a reset link has been sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      port: 587,
      secure: false, // use TLS
    });

    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

// Product upload route example
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  // Save product with imageUrl
  // ...your code to save to MongoDB...
  res.json({ message: 'Product added!', imageUrl });
});

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);

// Cart routes
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
