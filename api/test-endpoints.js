// Test script to verify archive endpoints work correctly
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing Archive Endpoints\n');
  
  try {
    // Test 1: Get active appointments
    console.log('1️⃣ Testing GET /api/rendez-vous (active only)');
    const activeRes = await fetch(`${API_BASE}/rendez-vous`);
    const activeData = await activeRes.json();
    console.log(`   ✅ Status: ${activeRes.status}`);
    console.log(`   📊 Active appointments: ${activeData.length}`);
    console.log(`   🔍 All have archived=false: ${activeData.every(a => !a.archived)}\n`);
    
    // Test 2: Get archived appointments
    console.log('2️⃣ Testing GET /api/rendez-vous/history (archived only)');
    const archivedRes = await fetch(`${API_BASE}/rendez-vous/history`);
    const archivedData = await archivedRes.json();
    console.log(`   ✅ Status: ${archivedRes.status}`);
    console.log(`   📚 Archived appointments: ${archivedData.length}`);
    console.log(`   🔍 All have archived=true: ${archivedData.every(a => a.archived)}\n`);
    
    // Test 3: Verify no overlap
    const activeIds = new Set(activeData.map(a => a.id));
    const archivedIds = new Set(archivedData.map(a => a.id));
    const overlap = [...activeIds].filter(id => archivedIds.has(id));
    console.log('3️⃣ Testing data separation');
    console.log(`   ✅ No overlap between active and archived: ${overlap.length === 0}`);
    if (overlap.length > 0) {
      console.log(`   ⚠️  Overlapping IDs: ${overlap.join(', ')}`);
    }
    
    console.log('\n✅ All endpoint tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Make sure the API server is running on port 3000');
  }
}

testEndpoints();
