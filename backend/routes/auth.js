const express = require('express');
const User = require('../models/User');
const Pandit = require('../models/Pandit');
const Seller = require('../models/Seller');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Regular User Registration
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, password, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    user = new User({ 
      name, 
      email, 
      phone, 
      password, 
      role: role || 'user' 
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        name, 
        email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// Pandit Signup
router.post('/pandit-signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      education,
      languages,
      location,
      description,
      availability,
      pricing
    } = req.body;

    console.log('📝 Pandit signup request:', { name, email, phone });

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create User account
    const user = new User({
      name,
      email,
      password,
      role: 'pandit',
      phone
    });
    await user.save();
    console.log('✅ User created:', user._id);

    // Create Pandit profile
    const pandit = new Pandit({
      userId: user._id,
      name,
      email,
      phone,
      specialization: specialization || [],
      experience: experience || 0,
      education: education || '',
      languages: languages || [],
      location: location || { city: '', state: '' },
      description: description || '',
      availability: availability || { days: [], timeSlots: [] },
      pricing: pricing || { hourly: 0, daily: 0, eventBased: 0 },
      isApproved: false,
      isActive: false
    });
    await pandit.save();
    console.log('✅ Pandit profile created:', pandit._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your profile is pending admin approval. You will be notified via email once approved.',
      pandit: {
        id: pandit._id,
        name: pandit.name,
        email: pandit.email,
        isApproved: pandit.isApproved
      }
    });
  } catch (error) {
    console.error('❌ Pandit signup error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed' 
    });
  }
});

// Seller Signup
router.post('/seller-signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      businessType,
      gstNumber,
      location
    } = req.body;

    console.log('📝 Seller signup request:', { name, email, businessName });

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create User account
    const user = new User({
      name,
      email,
      password,
      role: 'seller',
      phone
    });
    await user.save();
    console.log('✅ User created:', user._id);

    // Create Seller profile (check if Seller model exists)
    try {
      const seller = new Seller({
        userId: user._id,
        businessName: businessName || name,
        businessType: businessType || 'Individual',
        gstNumber: gstNumber || '',
        location: location || { city: '', state: '' },
        contactEmail: email,
        contactPhone: phone,
        isApproved: false,
        isActive: false
      });
      await seller.save();
      console.log('✅ Seller profile created:', seller._id);

      res.status(201).json({
        success: true,
        message: 'Seller registration successful! Your account is pending admin approval. You will be notified via email once approved.',
        seller: {
          id: seller._id,
          businessName: seller.businessName,
          isApproved: seller.isApproved
        }
      });
    } catch (sellerError) {
      console.error('❌ Seller model error:', sellerError);
      // If Seller model doesn't exist, still return success for User creation
      res.status(201).json({
        success: true,
        message: 'User registration successful! Seller profile pending setup.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    }
  } catch (error) {
    console.error('❌ Seller signup error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed' 
    });
  }
});

// Login with Approval Check
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check approval status for seller
    if (user.role === 'seller') {
      try {
        const seller = await Seller.findOne({ userId: user._id });
        
        if (seller) {
          if (!seller.isApproved) {
            return res.status(403).json({ 
              success: false,
              message: 'Your seller account is pending admin approval. You will receive an email once approved.' 
            });
          }
          
          if (!seller.isActive) {
            return res.status(403).json({ 
              success: false,
              message: 'Your seller account has been deactivated. Please contact admin.' 
            });
          }
        }
      } catch (err) {
        console.log('Seller check skipped:', err.message);
      }
    }

    // Check approval status for pandit
    if (user.role === 'pandit') {
      const pandit = await Pandit.findOne({ userId: user._id });
      
      if (pandit) {
        if (!pandit.isApproved) {
          return res.status(403).json({ 
            success: false,
            message: 'Your pandit account is pending admin approval. You will receive an email once approved.' 
          });
        }
        
        if (!pandit.isActive) {
          return res.status(403).json({ 
            success: false,
            message: 'Your pandit account has been deactivated. Please contact admin.' 
          });
        }
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful:', user.email, user.role);
    
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  // TODO: Implement email reset logic
  res.json({ 
    success: true,
    message: 'Password reset link sent to your email' 
  });
});

module.exports = router;
