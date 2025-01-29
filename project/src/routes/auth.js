import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from 'firebase-admin'; // Updated import statement for Firebase Admin


import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRecord = await auth.getUserByEmail(email);
    const user = userRecord ? { id: userRecord.uid, email: userRecord.email } : null;



    if (!userRecord) {


      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Provide a default export for the router
export default router; // Updated export statement
