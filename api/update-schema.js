import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function updateSchema() {
  let db;
  
  try {
    console.log('🔧 Updating database schema...');
    
    // Open database connection
    db = await open({
      filename: './dental-clinic.db',
      driver: sqlite3.Database
    });

    console.log('✓ Database connection established');

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = OFF');
    console.log('✓ Foreign keys temporarily disabled');

    // Create a backup of the rendez_vous table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rendez_vous_backup AS 
      SELECT * FROM rendez_vous
    `);
    console.log('✓ Backup created');

    // Drop the old table
    await db.exec('DROP TABLE IF EXISTS rendez_vous');
    console.log('✓ Old table dropped');

    // Create the new table with updated schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rendez_vous (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        patient_nom TEXT NOT NULL,
        nom TEXT,
        prenom TEXT,
        date DATE NOT NULL,
        heure TEXT NOT NULL,
        motif TEXT NOT NULL,
        statut TEXT CHECK(statut IN ('confirmé', 'en attente', 'annulé')) DEFAULT 'en attente',
        telephone TEXT,
        age INTEGER,
        archived INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ New table created with updated schema');

    // Restore data from backup, converting empty strings to NULL
    await db.exec(`
      INSERT INTO rendez_vous 
      SELECT 
        id,
        CASE WHEN patient_id = '' THEN NULL ELSE patient_id END,
        patient_nom,
        nom,
        prenom,
        date,
        heure,
        motif,
        statut,
        telephone,
        age,
        archived,
        created_at,
        updated_at
      FROM rendez_vous_backup
    `);
    console.log('✓ Data restored from backup');

    // Drop the backup table
    await db.exec('DROP TABLE IF EXISTS rendez_vous_backup');
    console.log('✓ Backup table removed');

    // Recreate the index
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id);
      CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date);
    `);
    console.log('✓ Indexes recreated');

    // Re-enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    console.log('✓ Foreign keys re-enabled');

    // Verify the update
    const count = await db.get('SELECT COUNT(*) as count FROM rendez_vous');
    console.log(`✓ Schema updated successfully! ${count.count} rendez-vous records preserved.`);
    
    await db.close();
    console.log('✓ Database connection closed');

  } catch (error) {
    console.error('❌ Schema update failed:', error);
    if (db) await db.close();
    process.exit(1);
  }
}

updateSchema();
