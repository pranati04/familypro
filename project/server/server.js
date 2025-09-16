import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import treeRoutes from './routes/trees.js';
import memberRoutes from './routes/members.js';
import { db } from './db.js';
import { sql } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// Test database connection
async function validateDatabaseConnection() {
  try {
    // Test the connection with a simple query
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ PostgreSQL database connection validated successfully');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Make sure DATABASE_URL is set and the database is accessible');
    process.exit(1);
  }
}

// Initialize server
async function startServer() {
  // Validate database connection before starting server
  await validateDatabaseConnection();
  
  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/members', memberRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'healthy' });
});

// Catch-all handler: send back the frontend app for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start the server
startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});