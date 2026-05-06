const API_BASE = 'http://localhost:3000/api';

async function testArchive() {
  try {
    console.log('🧪 Testing Archive Functionality\n');
    
    // 1. Create a test appointment
    console.log('1️⃣ Creating test appointment...');
    const testDate = new Date().toISOString().split('T')[0];
    const createResponse = await fetch(`${API_BASE}/rendez-vous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test-archive-' + Date.now(),
        patientId: null,
        patientNom: 'Test Archive',
        nom: 'Archive',
        prenom: 'Test',
        date: testDate,
        heure: '10:00',
        motif: 'Test archiving',
        statut: 'confirmé',
      }),
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Failed to create: ${JSON.stringify(error)}`);
    }
    
    const created = await createResponse.json();
    console.log('✅ Created:', created.id);
    
    // 2. Verify it's not archived
    console.log('\n2️⃣ Verifying appointment is active...');
    const getResponse = await fetch(`${API_BASE}/rendez-vous`);
    const allAppointments = await getResponse.json();
    const testAppointment = allAppointments.find(a => a.id === created.id);
    
    if (!testAppointment) {
      throw new Error('Test appointment not found!');
    }
    
    console.log('✅ Found appointment, archived:', testAppointment.archived);
    
    if (testAppointment.archived) {
      throw new Error('Appointment should not be archived yet!');
    }
    
    // 3. Archive by date
    console.log('\n3️⃣ Archiving appointments for date:', testDate);
    const archiveResponse = await fetch(`${API_BASE}/rendez-vous/archive-by-date`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: testDate }),
    });
    
    if (!archiveResponse.ok) {
      const error = await archiveResponse.json();
      throw new Error(`Failed to archive: ${JSON.stringify(error)}`);
    }
    
    const archiveResult = await archiveResponse.json();
    console.log('✅ Archived:', archiveResult.count, 'appointments');
    
    // 4. Verify it's archived
    console.log('\n4️⃣ Verifying appointment is archived...');
    const getResponse2 = await fetch(`${API_BASE}/rendez-vous`);
    const allAppointments2 = await getResponse2.json();
    const archivedAppointment = allAppointments2.find(a => a.id === created.id);
    
    if (!archivedAppointment) {
      // The GET route filters archived appointments, so this is expected
      console.log('✅ Appointment is filtered from active list (archived = 1)');
    } else if (archivedAppointment.archived) {
      console.log('✅ Appointment is archived:', archivedAppointment.archived);
    } else {
      throw new Error('Appointment should be archived!');
    }
    
    // 5. Clean up
    console.log('\n5️⃣ Cleaning up...');
    const deleteResponse = await fetch(`${API_BASE}/rendez-vous/${created.id}`, {
      method: 'DELETE',
    });
    
    if (!deleteResponse.ok) {
      console.warn('⚠️ Failed to delete test appointment');
    } else {
      console.log('✅ Test appointment deleted');
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testArchive();
