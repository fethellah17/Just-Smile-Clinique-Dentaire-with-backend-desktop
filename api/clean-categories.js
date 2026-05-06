import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function cleanCategories() {
  let db;
  
  try {
    // Open database connection
    db = await open({
      filename: './dental-clinic.db',
      driver: sqlite3.Database
    });

    console.log('🧹 Cleaning all categories from database...\n');

    // Get count before deletion
    const beforeCount = await db.get('SELECT COUNT(*) as count FROM categories');
    console.log(`📊 Current categories: ${beforeCount.count}`);

    if (beforeCount.count === 0) {
      console.log('✅ Database is already clean!');
      await db.close();
      return;
    }

    // Delete all categories (CASCADE will delete types, steps, and stages)
    await db.run('DELETE FROM categories');

    // Verify deletion
    const afterCount = await db.get('SELECT COUNT(*) as count FROM categories');
    console.log(`✅ Deleted ${beforeCount.count} categories`);
    console.log(`📊 Remaining categories: ${afterCount.count}`);

    // Also verify related tables are clean
    const typesCount = await db.get('SELECT COUNT(*) as count FROM category_types');
    const stepsCount = await db.get('SELECT COUNT(*) as count FROM type_steps');
    const stagesCount = await db.get('SELECT COUNT(*) as count FROM category_stages');

    console.log(`\n📋 Database Status:`);
    console.log(`   Categories: ${afterCount.count}`);
    console.log(`   Types: ${typesCount.count}`);
    console.log(`   Steps: ${stepsCount.count}`);
    console.log(`   Stages: ${stagesCount.count}`);

    console.log('\n✅ Database cleaned successfully!');
    console.log('💡 You can now create categories from scratch in the UI.');

    await db.close();
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    if (db) await db.close();
    process.exit(1);
  }
}

cleanCategories();
