// Quick test script to verify category API endpoints
// Run with: node test-category-api.js

const API_BASE = 'http://localhost:3000/api';

async function testCategoryAPI() {
  console.log('🧪 Testing Category API Endpoints\n');

  try {
    // Test 1: GET all categories
    console.log('1️⃣ Testing GET /api/categories');
    const getResponse = await fetch(`${API_BASE}/categories`);
    const categories = await getResponse.json();
    console.log(`✅ Found ${categories.length} categories`);
    
    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log(`   Sample: ${firstCategory.name} with ${firstCategory.types.length} types`);
    }
    console.log();

    // Test 2: POST new category
    console.log('2️⃣ Testing POST /api/categories');
    const newCategory = {
      id: `test-${Date.now()}`,
      name: 'Test Category',
      icon: 'TestIcon',
      color: '#FF5733',
      types: [
        {
          id: `type-${Date.now()}`,
          name: 'Test Type',
          steps: [
            { id: `step-${Date.now()}-1`, name: 'Step 1', order: 1 },
            { id: `step-${Date.now()}-2`, name: 'Step 2', order: 2 }
          ]
        }
      ],
      stages: [
        { id: `stage-${Date.now()}`, name: 'Test Stage', order: 1 }
      ]
    };

    const postResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    });

    if (postResponse.ok) {
      const created = await postResponse.json();
      console.log(`✅ Created category: ${created.name}`);
      console.log(`   ID: ${created.id}`);
      console.log(`   Types: ${created.types?.length || 0}`);
      console.log(`   Steps in first type: ${created.types?.[0]?.steps?.length || 0}`);
      
      // Test 3: GET single category
      console.log();
      console.log('3️⃣ Testing GET /api/categories/:id');
      const getOneResponse = await fetch(`${API_BASE}/categories/${created.id}`);
      const fetchedCategory = await getOneResponse.json();
      console.log(`✅ Fetched category: ${fetchedCategory.name}`);
      console.log(`   Has types: ${Array.isArray(fetchedCategory.types)}`);
      console.log(`   Has steps: ${Array.isArray(fetchedCategory.types?.[0]?.steps)}`);

      // Test 4: PUT update category
      console.log();
      console.log('4️⃣ Testing PUT /api/categories/:id');
      const updateData = {
        name: 'Updated Test Category',
        types: [
          {
            id: `type-updated-${Date.now()}`,
            name: 'Updated Type',
            steps: [
              { id: `step-updated-${Date.now()}`, name: 'Updated Step', order: 1 }
            ]
          }
        ]
      };

      const putResponse = await fetch(`${API_BASE}/categories/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (putResponse.ok) {
        const updated = await putResponse.json();
        console.log(`✅ Updated category: ${updated.name}`);
        console.log(`   New types count: ${updated.types?.length || 0}`);
      } else {
        console.log(`❌ Update failed: ${putResponse.status}`);
      }

      // Test 5: DELETE category
      console.log();
      console.log('5️⃣ Testing DELETE /api/categories/:id');
      const deleteResponse = await fetch(`${API_BASE}/categories/${created.id}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log(`✅ Deleted test category`);
      } else {
        console.log(`❌ Delete failed: ${deleteResponse.status}`);
      }
    } else {
      const error = await postResponse.json();
      console.log(`❌ Create failed: ${error.error}`);
    }

    console.log();
    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the API server is running on http://localhost:3000');
  }
}

testCategoryAPI();
