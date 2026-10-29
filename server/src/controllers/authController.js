const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, collegeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-grant ADMIN role if email starts with admin@
    const role = email.toLowerCase().startsWith('admin@') ? 'ADMIN' : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        collegeId: collegeId || null,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        collegeId: true,
        role: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        collegeId: user.collegeId,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        collegeId: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            claims: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, collegeId } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(collegeId !== undefined && { collegeId })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        collegeId: true,
        role: true
      }
    });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

module.exports = { register, login, getMe, updateProfile };
