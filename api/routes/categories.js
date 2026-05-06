import express from 'express';
import getDb from '../db.js';

const router = express.Router();

// GET all categories with their types, steps, and stages
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    
    const result = await Promise.all(categories.map(async (category) => {
      // Get types for this category
      const types = await db.all('SELECT * FROM category_types WHERE category_id = ?', category.id);
      
      // Get steps for each type
      const typesWithSteps = await Promise.all(types.map(async (type) => {
        const steps = await db.all('SELECT * FROM type_steps WHERE type_id = ? ORDER BY step_order', type.id);
        return {
          id: type.id,
          name: type.name,
          steps: steps.map(step => ({
            id: step.id,
            name: step.name,
            order: step.step_order
          }))
        };
      }));
      
      // Get stages for this category
      const stages = await db.all('SELECT * FROM category_stages WHERE category_id = ? ORDER BY stage_order', category.id);
      
      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        types: typesWithSteps,
        stages: stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          order: stage.stage_order
        }))
      };
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET single category by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const category = await db.get('SELECT * FROM categories WHERE id = ?', req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const types = await db.all('SELECT * FROM category_types WHERE category_id = ?', category.id);
    
    const typesWithSteps = await Promise.all(types.map(async (type) => {
      const steps = await db.all('SELECT * FROM type_steps WHERE type_id = ? ORDER BY step_order', type.id);
      return {
        id: type.id,
        name: type.name,
        steps: steps.map(step => ({
          id: step.id,
          name: step.name,
          order: step.step_order
        }))
      };
    }));
    
    const stages = await db.all('SELECT * FROM category_stages WHERE category_id = ? ORDER BY stage_order', category.id);
    
    const result = {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      types: typesWithSteps,
      stages: stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        order: stage.stage_order
      }))
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST create new category
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new category...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const db = await getDb();
    const { id, name, icon, color, types = [], stages = [] } = req.body;
    
    if (!id || !name || !icon || !color) {
      console.error('❌ Missing required fields:', { id, name, icon, color });
      return res.status(400).json({ error: 'Missing required fields: id, name, icon, color' });
    }
    
    console.log(`Creating category: ${name} (${id})`);
    console.log(`Types to create: ${types.length}`);
    console.log(`Stages to create: ${stages.length}`);
    
    // Use transaction for atomic operations
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Insert category
      console.log('Inserting category...');
      await db.run(
        'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
        [id, name, icon, color]
      );
      console.log('✅ Category inserted');
      
      // Insert types and their steps
      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        console.log(`Inserting type ${i + 1}/${types.length}: ${type.name} (${type.id})`);
        
        await db.run(
          'INSERT INTO category_types (id, category_id, name) VALUES (?, ?, ?)',
          [type.id, id, type.name]
        );
        console.log(`✅ Type inserted: ${type.name}`);
        
        if (Array.isArray(type.steps)) {
          console.log(`  Steps to insert: ${type.steps.length}`);
          for (let j = 0; j < type.steps.length; j++) {
            const step = type.steps[j];
            console.log(`  Inserting step ${j + 1}/${type.steps.length}: ${step.name} (order: ${step.order})`);
            
            await db.run(
              'INSERT INTO type_steps (id, type_id, name, step_order) VALUES (?, ?, ?, ?)',
              [step.id, type.id, step.name, step.order]
            );
            console.log(`  ✅ Step inserted: ${step.name}`);
          }
        }
      }
      
      // Insert stages
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        console.log(`Inserting stage ${i + 1}/${stages.length}: ${stage.name} (order: ${stage.order})`);
        
        await db.run(
          'INSERT INTO category_stages (id, category_id, name, stage_order) VALUES (?, ?, ?, ?)',
          [stage.id, id, stage.name, stage.order]
        );
        console.log(`✅ Stage inserted: ${stage.name}`);
      }
      
      await db.run('COMMIT');
      console.log('✅ Transaction committed successfully');
      
      // Fetch the complete category with types and steps
      const newCategory = await db.get('SELECT * FROM categories WHERE id = ?', id);
      const categoryTypes = await db.all('SELECT * FROM category_types WHERE category_id = ?', id);
      
      const typesWithSteps = await Promise.all(categoryTypes.map(async (type) => {
        const steps = await db.all('SELECT * FROM type_steps WHERE type_id = ? ORDER BY step_order', type.id);
        return {
          id: type.id,
          name: type.name,
          steps: steps.map(step => ({
            id: step.id,
            name: step.name,
            order: step.step_order
          }))
        };
      }));
      
      const categoryStages = await db.all('SELECT * FROM category_stages WHERE category_id = ? ORDER BY stage_order', id);
      
      const result = {
        id: newCategory.id,
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        types: typesWithSteps,
        stages: categoryStages.map(stage => ({
          id: stage.id,
          name: stage.name,
          order: stage.stage_order
        }))
      };
      
      console.log('✅ Category created successfully:', result.name);
      res.status(201).json(result);
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('❌ Transaction rolled back due to error');
      throw error;
    }
  } catch (error) {
    console.error('❌ Error creating category:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql
    });
    
    if (error.message && error.message.includes('UNIQUE constraint')) {
      res.status(409).json({ 
        error: 'Category with this ID or name already exists',
        details: error.message 
      });
    } else if (error.message && error.message.includes('FOREIGN KEY constraint')) {
      res.status(400).json({ 
        error: 'Foreign key constraint failed',
        details: error.message 
      });
    } else if (error.message && error.message.includes('NOT NULL constraint')) {
      res.status(400).json({ 
        error: 'Missing required field',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create category',
        details: error.message 
      });
    }
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, icon, color, types, stages } = req.body;
    
    const category = await db.get('SELECT * FROM categories WHERE id = ?', req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Update category basic info
      await db.run(
        'UPDATE categories SET name = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name || category.name, icon || category.icon, color || category.color, req.params.id]
      );
      
      // If types are provided, update them
      if (Array.isArray(types)) {
        // Delete existing types and steps (cascade will handle steps)
        await db.run('DELETE FROM category_types WHERE category_id = ?', req.params.id);
        
        // Insert new types and steps
        for (const type of types) {
          await db.run(
            'INSERT INTO category_types (id, category_id, name) VALUES (?, ?, ?)',
            [type.id, req.params.id, type.name]
          );
          
          if (Array.isArray(type.steps)) {
            for (const step of type.steps) {
              await db.run(
                'INSERT INTO type_steps (id, type_id, name, step_order) VALUES (?, ?, ?, ?)',
                [step.id, type.id, step.name, step.order]
              );
            }
          }
        }
      }
      
      // If stages are provided, update them
      if (Array.isArray(stages)) {
        await db.run('DELETE FROM category_stages WHERE category_id = ?', req.params.id);
        
        for (const stage of stages) {
          await db.run(
            'INSERT INTO category_stages (id, category_id, name, stage_order) VALUES (?, ?, ?, ?)',
            [stage.id, req.params.id, stage.name, stage.order]
          );
        }
      }
      
      await db.run('COMMIT');
      
      // Fetch the complete updated category
      const updated = await db.get('SELECT * FROM categories WHERE id = ?', req.params.id);
      const categoryTypes = await db.all('SELECT * FROM category_types WHERE category_id = ?', req.params.id);
      
      const typesWithSteps = await Promise.all(categoryTypes.map(async (type) => {
        const steps = await db.all('SELECT * FROM type_steps WHERE type_id = ? ORDER BY step_order', type.id);
        return {
          id: type.id,
          name: type.name,
          steps: steps.map(step => ({
            id: step.id,
            name: step.name,
            order: step.step_order
          }))
        };
      }));
      
      const categoryStages = await db.all('SELECT * FROM category_stages WHERE category_id = ? ORDER BY stage_order', req.params.id);
      
      const result = {
        id: updated.id,
        name: updated.name,
        icon: updated.icon,
        color: updated.color,
        types: typesWithSteps,
        stages: categoryStages.map(stage => ({
          id: stage.id,
          name: stage.name,
          order: stage.stage_order
        }))
      };
      
      res.json(result);
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const category = await db.get('SELECT * FROM categories WHERE id = ?', req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Use transaction for safe deletion
    await db.run('BEGIN TRANSACTION');
    
    try {
      // With foreign keys enabled, CASCADE will handle related data automatically
      // But we'll add explicit cleanup as a safety measure
      
      // Get all types for this category
      const types = await db.all('SELECT id FROM category_types WHERE category_id = ?', req.params.id);
      const typeIds = types.map(t => t.id);
      
      // Delete steps for all types (will cascade from type deletion, but being explicit)
      if (typeIds.length > 0) {
        const placeholders = typeIds.map(() => '?').join(',');
        await db.run(`DELETE FROM type_steps WHERE type_id IN (${placeholders})`, typeIds);
      }
      
      // Delete category types
      await db.run('DELETE FROM category_types WHERE category_id = ?', req.params.id);
      
      // Delete category stages
      await db.run('DELETE FROM category_stages WHERE category_id = ?', req.params.id);
      
      // Finally, delete the category itself
      await db.run('DELETE FROM categories WHERE id = ?', req.params.id);
      
      await db.run('COMMIT');
      
      console.log(`✓ Category ${req.params.id} deleted with all related data`);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
