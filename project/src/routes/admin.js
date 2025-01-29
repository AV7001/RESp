import express from 'express';
import { isAdmin } from '../middleware/auth.js';
import { db } from '../lib/firebase.js'; // Updated import statement for Firebase
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all staff members
router.get('/staff', isAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'staff').get();
    
    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: 'No staff members found' });
    }

    const staffMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: staffMembers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new staff member
router.post('/staff', isAdmin, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaffRef = db.collection('users').doc();
    await newStaffRef.set({
      email,
      password_hash: hashedPassword,
      role: 'staff',
      name
    });

    const newStaff = { id: newStaffRef.id, email, role: 'staff', name };
    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update staff member
router.put('/staff/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    const staffRef = db.collection('users').doc(id);
    await staffRef.update({ email, name });

    const updatedStaff = { id, email, name };
    res.json({ success: true, data: updatedStaff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete staff member
router.delete('/staff/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).delete();
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
