import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { getDb } from './db.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import patientsRouter from './routes/patients.js';
import rendezVousRouter from './routes/rendez-vous.js';
import passagesDirectsRouter from './routes/passages-directs.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Auto-initialize users table on startup
async function ensureUsersTable() {
  const db = await getDb();
  
  // Create users table if it doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await db.exec(createTableSQL);
  console.log('✓ Users table ready');
  
  // Check if default user exists
  const user = await db.get('SELECT * FROM users WHERE email = ?', ['dr.souidi@justsmile.dz']);
  
  if (!user) {
    // Create default user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      ['user-1', 'dr.souidi@justsmile.dz', hashedPassword, 'Dr. Souidi']
    );
    console.log('✓ Default user created: dr.souidi@justsmile.dz / admin123');
  } else {
    console.log('✓ Default user already exists');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/rendez-vous', rendezVousRouter);
app.use('/api/passages-directs', passagesDirectsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize users table before starting server
ensureUsersTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints:`);
      console.log(`   Auth:`);
      console.log(`     POST   /api/auth/login`);
      console.log(`     PUT    /api/auth/update-password`);
      console.log(`     POST   /api/auth/reset-password`);
      console.log(`   Categories:`);
      console.log(`     GET    /api/categories`);
      console.log(`     POST   /api/categories`);
      console.log(`     PUT    /api/categories/:id`);
      console.log(`     DELETE /api/categories/:id`);
      console.log(`   Patients:`);
      console.log(`     GET    /api/patients`);
      console.log(`     POST   /api/patients`);
      console.log(`     PUT    /api/patients/:id`);
      console.log(`     DELETE /api/patients/:id`);
      console.log(`   Rendez-vous:`);
      console.log(`     GET    /api/rendez-vous`);
      console.log(`     POST   /api/rendez-vous`);
      console.log(`     PUT    /api/rendez-vous/:id`);
      console.log(`     DELETE /api/rendez-vous/:id`);
      console.log(`     GET    /api/rendez-vous/stats/dashboard`);
      console.log(`   Passages Directs:`);
      console.log(`     GET    /api/passages-directs`);
      console.log(`     POST   /api/passages-directs`);
      console.log(`     PUT    /api/passages-directs/:id`);
      console.log(`     DELETE /api/passages-directs/:id`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  });
