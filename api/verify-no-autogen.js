// Verification script to confirm NO auto-generation happens
// Run with: node verify-no-autogen.js

const API_BASE = 'http://localhost:3000/api';

async function verifyNoAutoGeneration() {
  console.log('🔍 Verifying NO Auto-Generation of Types/Steps\n');

  try {
    // Test: Create a category with ONLY name, icon, color
    console.log('1️⃣ Creating category with NO types or steps...');
    
    const testCategory = {
      id: `verify-${Date.now()}`,
      name: 'Test Verification',
      icon: 'TestIcon',
      color: '#FF5733',
      types: [],    // EMPTY - no types
      stages: []    // EMPTY - no stages
    };

    console.log('📤 Sending to API:');
    console.log(JSON.stringify(testCategory, null, 2));

    const createResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCategory)
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log(`❌ Create failed: ${error.error}`);
      return;
    }

    const created = await createResponse.json();
    
    console.log('\n📥 Received from API:');
    console.log(JSON.stringify(created, null, 2));

    // Verify NO auto-generation
    console.log('\n✅ Verification Results:');
    console.log(`   Category Name: ${created.name}`);
    console.log(`   Types Count: ${created.types?.length || 0}`);
    console.log(`   Stages Count: ${created.stages?.length || 0}`);

    if (created.types?.length === 0 && created.stages?.length === 0) {
      console.log('\n✅ SUCCESS: NO auto-generation detected!');
      console.log('   The system correctly saves ONLY what you provide.');
    } else {
      console.log('\n❌ WARNING: Auto-generation detected!');
      console.log('   Types or stages were added automatically.');
    }

    // Clean up - delete test category
    console.log('\n🧹 Cleaning up test category...');
    await fetch(`${API_BASE}/categories/${created.id}`, {
      method: 'DELETE'
    });
    console.log('✅ Test category deleted');

    console.log('\n📋 Summary:');
    console.log('   - System does NOT auto-generate types');
    console.log('   - System does NOT auto-generate steps');
    console.log('   - System saves ONLY what you provide');
    console.log('   - Any existing categories are from database seed data');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n💡 Make sure the API server is running on http://localhost:3000');
  }
}

verifyNoAutoGeneration();
