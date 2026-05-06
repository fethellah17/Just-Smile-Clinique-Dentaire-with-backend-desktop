import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function fixConstraint() {
  console.log('🔧 Fixing rendez_vous foreign key constraint...');
  console.log('⚠️  This will recreate the table to enforce ON DELETE SET NULL\n');
  
  const db = await open({
    filename: '../dental-clinic.db',
    driver: sqlite3.Database
  });
  
  // Disable foreign keys temporarily
  await db.exec('PRAGMA foreign_keys = OFF');
  console.log('🔓 Foreign keys disabled temporarily');
  
  console.log('\n📋 BEFORE - Checking current schema...');
  
  // Get current foreign key info
  const fkInfoBefore = await db.all('PRAGMA foreign_key_list(rendez_vous)');
  console.log('Current foreign keys:', fkInfoBefore);
  if (fkInfoBefore.length > 0) {
    fkInfoBefore.forEach(fk => {
      console.log(`   ${fk.from} -> ${fk.table}(${fk.to}) ON DELETE ${fk.on_delete}`);
    });
  }
  
  console.log('\n🔨 Recreating table with correct constraints...');
  
  await db.exec('BEGIN TRANSACTION');
  
  try {
    // Create new table with STRICT ON DELETE SET NULL
    await db.exec(`
      CREATE TABLE rendez_vous_new (
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
    console.log('✅ New table created');
    
    // Copy all existing data
    await db.exec(`
      INSERT INTO rendez_vous_new (
        id, patient_id, patient_nom, nom, prenom, date, heure, motif, 
        statut, telephone, age, archived, created_at, updated_at
      )
      SELECT 
        id, patient_id, patient_nom, nom, prenom, date, heure, motif, 
        statut, telephone, age, archived, created_at, updated_at
      FROM rendez_vous
    `);
    
    const count = await db.get('SELECT COUNT(*) as count FROM rendez_vous_new');
    console.log(`✅ Copied ${count.count} records`);
    
    // Drop old table
    await db.exec('DROP TABLE rendez_vous');
    console.log('✅ Old table dropped');
    
    // Rename new table
    await db.exec('ALTER TABLE rendez_vous_new RENAME TO rendez_vous');
    console.log('✅ New table renamed to rendez_vous');
    
    // Recreate indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id);
      CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date);
    `);
    console.log('✅ Indexes recreated');
    
    await db.exec('COMMIT');
    console.log('✅ Transaction committed');
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('❌ Transaction rolled back due to error');
    throw error;
  }
  
  // Re-enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');
  console.log('\n🔒 Foreign keys re-enabled');
  
  console.log('\n📋 AFTER - Verifying new schema...');
  
  // Verify table structure
  const tableInfo = await db.all('PRAGMA table_info(rendez_vous)');
  const patientIdCol = tableInfo.find(col => col.name === 'patient_id');
  console.log(`✅ patient_id column: ${patientIdCol.type}, nullable: ${patientIdCol.notnull === 0 ? 'YES' : 'NO'}`);
  
  // Verify foreign key constraint
  const fkInfoAfter = await db.all('PRAGMA foreign_key_list(rendez_vous)');
  console.log('\n✅ New foreign key constraints:');
  if (fkInfoAfter.length > 0) {
    fkInfoAfter.forEach(fk => {
      console.log(`   ${fk.from} -> ${fk.table}(${fk.to})`);
      console.log(`   ON DELETE: ${fk.on_delete}`);
      console.log(`   ON UPDATE: ${fk.on_update}`);
    });
  } else {
    console.log('   No foreign keys found');
  }
  
  // Verify foreign keys are enabled
  const fkEnabled = await db.get('PRAGMA foreign_keys');
  console.log(`\n✅ Foreign keys enabled: ${fkEnabled.foreign_keys === 1 ? 'YES' : 'NO'}`);
  
  // Count records
  const finalCount = await db.get('SELECT COUNT(*) as count FROM rendez_vous');
  console.log(`✅ Total appointments in table: ${finalCount.count}`);
  
  await db.close();
  console.log('\n✅ Done! The constraint is now ON DELETE SET NULL');
  console.log('   Deleting a patient will set patient_id to NULL (not delete the appointment)');
}

fixConstraint().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
