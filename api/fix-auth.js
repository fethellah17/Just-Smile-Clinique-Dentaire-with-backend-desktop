import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function fixAuth() {
  console.log('🔧 Starting authentication fix...');
  
  // Connect to database (using root dental-clinic.db)
  const db = await open({
    filename: '../dental-clinic.db',
    driver: sqlite3.Database
  });
  
  console.log('✅ Connected to database');
  
  // Check if users table exists
  const tableExists = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  );
  
  if (!tableExists) {
    console.log('❌ Users table does not exist. Creating it...');
    await db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
  } else {
    console.log('✅ Users table exists');
  }
  
  const email = 'dr.souidi@justsmile.dz';
  const password = 'admin123';
  const name = 'Dr. Souidi';
  
  // Hash the password with bcrypt
  console.log('🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Check if user exists
  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  
  if (existingUser) {
    console.log('👤 User exists. Updating password...');
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [hashedPassword, email]
    );
    console.log('✅ Password updated successfully');
  } else {
    console.log('👤 User does not exist. Creating new user...');
    const userId = randomUUID();
    await db.run(
      'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, name]
    );
    console.log('✅ User created successfully');
  }
  
  // Verify the user can be authenticated
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (passwordMatch) {
    console.log('✅ Authentication verified successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log('❌ Authentication verification failed!');
  }
  
  await db.close();
  console.log('\n✅ Done!');
}

fixAuth().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
