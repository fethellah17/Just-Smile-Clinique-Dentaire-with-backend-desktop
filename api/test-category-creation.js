import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function testCategoryCreation() {
  console.log('🧪 Testing category creation...\n');
  
  const db = await open({
    filename: '../dental-clinic.db',
    driver: sqlite3.Database
  });
  
  await db.exec('PRAGMA foreign_keys = ON');
  
  // Test data structure (same as frontend sends)
  const testCategory = {
    id: `test-${Date.now()}`,
    name: 'Test Category',
    icon: '🦷',
    color: '#800020',
    types: [
      {
        id: `type-${Date.now()}-1`,
        name: 'Type 1',
        steps: [
          { id: `step-${Date.now()}-1`, name: 'Step 1', order: 1 },
          { id: `step-${Date.now()}-2`, name: 'Step 2', order: 2 }
        ]
      },
      {
        id: `type-${Date.now()}-2`,
        name: 'Type 2',
        steps: [
          { id: `step-${Date.now()}-3`, name: 'Step A', order: 1 }
        ]
      }
    ],
    stages: []
  };
  
  console.log('Test data:', JSON.stringify(testCategory, null, 2));
  console.log('\n🔨 Starting transaction...\n');
  
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Insert category
    console.log('1️⃣ Inserting category...');
    await db.run(
      'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
      [testCategory.id, testCategory.name, testCategory.icon, testCategory.color]
    );
    console.log('✅ Category inserted\n');
    
    // Insert types and steps
    for (let i = 0; i < testCategory.types.length; i++) {
      const type = testCategory.types[i];
      console.log(`2️⃣ Inserting type ${i + 1}: ${type.name}`);
      
      await db.run(
        'INSERT INTO category_types (id, category_id, name) VALUES (?, ?, ?)',
        [type.id, testCategory.id, type.name]
      );
      console.log(`✅ Type inserted\n`);
      
      for (let j = 0; j < type.steps.length; j++) {
        const step = type.steps[j];
        console.log(`3️⃣ Inserting step ${j + 1}: ${step.name} (order: ${step.order})`);
        
        await db.run(
          'INSERT INTO type_steps (id, type_id, name, step_order) VALUES (?, ?, ?, ?)',
          [step.id, type.id, step.name, step.order]
        );
        console.log(`✅ Step inserted\n`);
      }
    }
    
    await db.run('COMMIT');
    console.log('✅ Transaction committed!\n');
    
    // Verify the data
    console.log('🔍 Verifying inserted data...\n');
    
    const category = await db.get('SELECT * FROM categories WHERE id = ?', testCategory.id);
    console.log('Category:', category);
    
    const types = await db.all('SELECT * FROM category_types WHERE category_id = ?', testCategory.id);
    console.log('Types:', types);
    
    for (const type of types) {
      const steps = await db.all('SELECT * FROM type_steps WHERE type_id = ?', type.id);
      console.log(`Steps for ${type.name}:`, steps);
    }
    
    console.log('\n✅ Test successful! Category creation works correctly.');
    console.log('\n🧹 Cleaning up test data...');
    
    // Cleanup
    await db.run('DELETE FROM categories WHERE id = ?', testCategory.id);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('SQL:', error.sql);
  }
  
  await db.close();
}

testCategoryCreation().catch(console.error);
