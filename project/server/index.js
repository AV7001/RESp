import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token
const authenticateUser = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Create a new user (Admin only)
app.post('/api/users', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    
    res.status(201).json({ uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users (Admin only)
app.get('/api/users', authenticateUser, isAdmin, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    res.json(listUsersResult.users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});