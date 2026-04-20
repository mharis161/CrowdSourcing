import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-development', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and optionally company
    const newUserData = {
      name,
      email,
      passwordHash,
      role,
    };

    let user;

    if (role === 'COMPANY') {
      if (!companyName) {
        return res.status(400).json({ message: 'Company name is required for Company role' });
      }
      user = await prisma.user.create({
        data: {
          ...newUserData,
          company: {
            create: {
              companyName,
              country: req.body.country || 'Pakistan'
            }
          }
        },
        include: { company: true }
      });
    } else {
      user = await prisma.user.create({
        data: newUserData
      });
    }

    if (user) {
      // Remove passwordHash from response
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        ...userWithoutPassword,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
