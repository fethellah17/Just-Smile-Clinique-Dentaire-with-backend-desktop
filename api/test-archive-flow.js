import getDb from './db.js';

async function testArchiveFlow() {
  console.log('🧪 Testing Archive Flow\n');
  
  const db = await getDb();
  
  try {
    // Step 1: Check current appointments
    console.log('📋 Step 1: Current appointments in database');
    const allAppointments = await db.all('SELECT id, date, heure, patient_nom, statut, archived FROM rendez_vous ORDER BY date, heure');
    console.log(`Total appointments: ${allAppointments.length}`);
    allAppointments.forEach(apt => {
      console.log(`  - ${apt.date} ${apt.heure} | ${apt.patient_nom} | Status: ${apt.statut} | Archived: ${apt.archived}`);
    });
    
    // Step 2: Check active appointments (archived = 0)
    console.log('\n📋 Step 2: Active appointments (archived = 0)');
    const activeAppointments = await db.all('SELECT id, date, heure, patient_nom, statut FROM rendez_vous WHERE archived = 0 ORDER BY date, heure');
    console.log(`Active appointments: ${activeAppointments.length}`);
    activeAppointments.forEach(apt => {
      console.log(`  - ${apt.date} ${apt.heure} | ${apt.patient_nom} | Status: ${apt.statut}`);
    });
    
    // Step 3: Check archived appointments (archived = 1)
    console.log('\n📋 Step 3: Archived appointments (archived = 1)');
    const archivedAppointments = await db.all('SELECT id, date, heure, patient_nom, statut FROM rendez_vous WHERE archived = 1 ORDER BY date, heure');
    console.log(`Archived appointments: ${archivedAppointments.length}`);
    archivedAppointments.forEach(apt => {
      console.log(`  - ${apt.date} ${apt.heure} | ${apt.patient_nom} | Status: ${apt.statut}`);
    });
    
    // Step 4: Find dates with completed appointments that can be archived
    console.log('\n📋 Step 4: Dates with archivable appointments');
    const archivableDates = await db.all(`
      SELECT date, 
             COUNT(*) as total,
             SUM(CASE WHEN statut IN ('confirmé', 'annulé') THEN 1 ELSE 0 END) as completed,
             SUM(CASE WHEN statut = 'en attente' THEN 1 ELSE 0 END) as pending
      FROM rendez_vous 
      WHERE archived = 0
      GROUP BY date
      HAVING pending = 0 AND completed > 0
      ORDER BY date
    `);
    
    if (archivableDates.length === 0) {
      console.log('  ℹ️  No dates with archivable appointments found');
      console.log('  (All appointments must be either confirmé or annulé to be archivable)');
    } else {
      console.log(`Found ${archivableDates.length} date(s) ready for archiving:`);
      archivableDates.forEach(d => {
        console.log(`  - ${d.date}: ${d.completed} completed appointment(s)`);
      });
      
      // Step 5: Test archiving the first date
      if (archivableDates.length > 0) {
        const testDate = archivableDates[0].date;
        console.log(`\n📦 Step 5: Testing archive for date: ${testDate}`);
        
        const result = await db.run(
          `UPDATE rendez_vous 
           SET archived = 1, updated_at = CURRENT_TIMESTAMP 
           WHERE date = ? AND archived = 0 AND statut IN ('confirmé', 'annulé')`,
          testDate
        );
        
        console.log(`✅ Archived ${result.changes} appointment(s)`);
        
        // Verify the archive
        console.log('\n🔍 Step 6: Verifying archive');
        const verifyActive = await db.all('SELECT COUNT(*) as count FROM rendez_vous WHERE date = ? AND archived = 0', testDate);
        const verifyArchived = await db.all('SELECT COUNT(*) as count FROM rendez_vous WHERE date = ? AND archived = 1', testDate);
        
        console.log(`  Active appointments for ${testDate}: ${verifyActive[0].count}`);
        console.log(`  Archived appointments for ${testDate}: ${verifyArchived[0].count}`);
        
        // Rollback for testing purposes
        console.log('\n↩️  Rolling back test archive...');
        await db.run(
          `UPDATE rendez_vous 
           SET archived = 0, updated_at = CURRENT_TIMESTAMP 
           WHERE date = ?`,
          testDate
        );
        console.log('✅ Rollback complete');
      }
    }
    
    console.log('\n✅ Archive flow test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testArchiveFlow();
