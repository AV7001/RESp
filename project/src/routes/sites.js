import express from 'express';
import { isAdmin } from '../middleware/auth.js';
import { db } from '../lib/firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const router = express.Router();

// Middleware to ensure the user is an admin
router.use(isAdmin);

// Create a new site
router.post('/', async (req, res) => {
  try {
    const newSite = req.body;
    const docRef = await addDoc(collection(db, 'sites'), newSite);
    res.status(201).json({ id: docRef.id, ...newSite });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create site' });
  }

// Update an existing site
router.put('/:id', async (req, res) => {
  try {
    const siteId = req.params.id;
    const updatedSite = req.body;
    await updateDoc(doc(db, 'sites', siteId), updatedSite);
    res.status(200).json({ id: siteId, ...updatedSite });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete a site
router.delete('/:id', async (req, res) => {
  try {
    const siteId = req.params.id;
    await deleteDoc(doc(db, 'sites', siteId));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete site' });
  }
});
});

// Update site (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, localArea, district, latitude, longitude, transmissionMode, battery } = req.body;

    const siteRef = db.collection('sites').doc(id);
    await siteRef.update({ 
      name, 
      local_area: localArea, 
      district, 
      latitude, 
      longitude, 
      transmission_mode: transmissionMode,
      battery // Include battery details
    });

    const updatedSite = { id, name, local_area: localArea, district, latitude, longitude, transmission_mode: transmissionMode, battery };
    res.json({ success: true, data: updatedSite });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete site (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('sites').doc(id).delete();
    res.json({ success: true, message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; // Updated export statement
