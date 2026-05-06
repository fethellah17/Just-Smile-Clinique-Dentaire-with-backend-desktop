import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function cleanupOrphanedData() {
  let db;
  
  try {
    // Open database connection
    db = await open({
      filename: './dental-clinic.db',
      driver: sqlite3.Database
    });

    console.log('🧹 Cleaning up orphaned data...\n');

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    console.log('✓ Foreign keys enabled');

    // Find orphaned category_types (types without a valid category)
    const orphanedTypes = await db.all(`
      SELECT ct.id, ct.name, ct.category_id
      FROM category_types ct
      LEFT JOIN categories c ON ct.category_id = c.id
      WHERE c.id IS NULL
    `);

    console.log(`\n📊 Found ${orphanedTypes.length} orphaned category types`);
    if (orphanedTypes.length > 0) {
      console.log('Orphaned types:');
      orphanedTypes.forEach(type => {
        console.log(`  - ${type.name} (category_id: ${type.category_id})`);
      });
    }

    // Find orphaned type_steps (steps without a valid type)
    const orphanedSteps = await db.all(`
      SELECT ts.id, ts.name, ts.type_id
      FROM type_steps ts
      LEFT JOIN category_types ct ON ts.type_id = ct.id
      WHERE ct.id IS NULL
    `);

    console.log(`\n📊 Found ${orphanedSteps.length} orphaned type steps`);
    if (orphanedSteps.length > 0) {
      console.log('Orphaned steps:');
      orphanedSteps.forEach(step => {
        console.log(`  - ${step.name} (type_id: ${step.type_id})`);
      });
    }

    // Find orphaned category_stages (stages without a valid category)
    const orphanedStages = await db.all(`
      SELECT cs.id, cs.name, cs.category_id
      FROM category_stages cs
      LEFT JOIN categories c ON cs.category_id = c.id
      WHERE c.id IS NULL
    `);

    console.log(`\n📊 Found ${orphanedStages.length} orphaned category stages`);
    if (orphanedStages.length > 0) {
      console.log('Orphaned stages:');
      orphanedStages.forEach(stage => {
        console.log(`  - ${stage.name} (category_id: ${stage.category_id})`);
      });
    }

    // Delete orphaned data
    if (orphanedTypes.length > 0 || orphanedSteps.length > 0 || orphanedStages.length > 0) {
      console.log('\n🗑️  Deleting orphaned data...');

      // Delete orphaned type_steps first (child of category_types)
      if (orphanedSteps.length > 0) {
        await db.run(`
          DELETE FROM type_steps
          WHERE type_id NOT IN (SELECT id FROM category_types)
        `);
        console.log(`✓ Deleted ${orphanedSteps.length} orphaned type steps`);
      }

      // Delete orphaned category_types
      if (orphanedTypes.length > 0) {
        await db.run(`
          DELETE FROM category_types
          WHERE category_id NOT IN (SELECT id FROM categories)
        `);
        console.log(`✓ Deleted ${orphanedTypes.length} orphaned category types`);
      }

      // Delete orphaned category_stages
      if (orphanedStages.length > 0) {
        await db.run(`
          DELETE FROM category_stages
          WHERE category_id NOT IN (SELECT id FROM categories)
        `);
        console.log(`✓ Deleted ${orphanedStages.length} orphaned category stages`);
      }
    } else {
      console.log('\n✅ No orphaned data found! Database is clean.');
    }

    // Verify cleanup
    console.log('\n📋 Verification:');
    const remainingTypes = await db.get('SELECT COUNT(*) as count FROM category_types');
    const remainingSteps = await db.get('SELECT COUNT(*) as count FROM type_steps');
    const remainingStages = await db.get('SELECT COUNT(*) as count FROM category_stages');
    const categories = await db.get('SELECT COUNT(*) as count FROM categories');

    console.log(`  Categories: ${categories.count}`);
    console.log(`  Category Types: ${remainingTypes.count}`);
    console.log(`  Type Steps: ${remainingSteps.count}`);
    console.log(`  Category Stages: ${remainingStages.count}`);

    console.log('\n✅ Cleanup complete!');
    console.log('💡 Foreign keys are now enabled. Future deletions will cascade automatically.');

    await db.close();
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    if (db) await db.close();
    process.exit(1);
  }
}

cleanupOrphanedData();
