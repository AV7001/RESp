import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import tasksRouter from './routes/tasks.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import sitesRouter from './routes/sites.js';

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

// Use routes
app.use('/api/tasks', tasksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/sites', sitesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
