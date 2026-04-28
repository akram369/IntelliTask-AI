const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/* =========================
   🔐 SIGNUP
========================= */
exports.signup = async (req, res) => {
  try {
    console.log("📩 Signup:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 🔥 HASH PASSWORD (CRITICAL FIX)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id),
    });

  } catch (error) {
    console.error("❌ SIGNUP FULL ERROR:", error);

    res.status(500).json({
      message: error.message,
      type: error.name,
    });
  }
};

/* =========================
   🔐 LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    console.log("📩 Login:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 🔥 SAFE PASSWORD CHECK (no dependency on model method)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id),
    });

  } catch (error) {
    console.error("❌ LOGIN FULL ERROR:", error);

    res.status(500).json({
      message: error.message,
      type: error.name,
    });
  }
};