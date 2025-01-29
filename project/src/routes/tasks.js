import express from 'express';
import { db } from '../lib/firebase.js'; // Updated import statement for Firebase

const router = express.Router();

// Get tasks for current user
router.get('/', async (req, res) => {
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('assigned_to', '==', req.user.id).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ success: false, error: 'No tasks found' });
    }

    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update task status
router.patch('/:taskId/status', async (req, res) => {
  try {
    const { status } = req.body;

    // Input validation
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const completedAt = status === 'completed' ? new Date() : null;

    const taskRef = db.collection('tasks').doc(req.params.taskId);
    await taskRef.update({ 
      status,
      completed_at: completedAt
    });

    const updatedTask = await taskRef.get();
    res.json({ success: true, data: { id: updatedTask.id, ...updatedTask.data() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete task
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    await db.collection('tasks').doc(taskId).delete();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
