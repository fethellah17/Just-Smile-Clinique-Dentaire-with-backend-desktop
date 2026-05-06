import express from 'express';
import getDb from '../db.js';

const router = express.Router();

// Helper function to handle SQLite busy errors with retry logic
async function executeWithRetry(dbOperation, maxRetries = 3, delayMs = 100) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await dbOperation();
    } catch (error) {
      if (error.message.includes('database is locked') && attempt < maxRetries) {
        console.log(`⏳ Database locked, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        throw error;
      }
    }
  }
}

// GET all passages directs
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    
    console.log('📋 Fetching passages directs');
    
    const passages = await db.all(
      'SELECT * FROM passages_directs ORDER BY date DESC, heure DESC'
    );
    
    const result = passages.map(p => ({
      id: p.id,
      nomPrenom: p.nom_prenom,
      date: p.date,
      heure: p.heure,
      motif: p.motif,
      statut: p.statut,
      telephone: p.telephone,
      age: p.age
    }));
    
    console.log(`✅ Returned ${result.length} passages directs`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching passages directs:', error);
    res.status(500).json({ error: 'Failed to fetch passages directs' });
  }
});

// GET single passage direct by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const passage = await db.get('SELECT * FROM passages_directs WHERE id = ?', req.params.id);
    
    if (!passage) {
      return res.status(404).json({ error: 'Passage direct not found' });
    }
    
    res.json({
      id: passage.id,
      nomPrenom: passage.nom_prenom,
      date: passage.date,
      heure: passage.heure,
      motif: passage.motif,
      statut: passage.statut,
      telephone: passage.telephone,
      age: passage.age
    });
  } catch (error) {
    console.error('Error fetching passage direct:', error);
    res.status(500).json({ error: 'Failed to fetch passage direct' });
  }
});

// POST create new passage direct
router.post('/', async (req, res) => {
  try {
    console.log('🔍 DEBUG BACKEND - RECEIVED DATA:', JSON.stringify(req.body, null, 2));
    
    const db = await getDb();
    const {
      nomPrenom,
      date,
      heure,
      motif,
      statut,
      telephone,
      age
    } = req.body;
    
    console.log('📝 Creating passage direct:', { nomPrenom, date, heure, motif });
    
    if (!nomPrenom || !date || !heure || !motif) {
      console.error('❌ Missing required fields:', { nomPrenom, date, heure, motif });
      return res.status(400).json({ error: 'Missing required fields: nomPrenom, date, heure, motif' });
    }
    
    // Generate unique ID using timestamp + random
    const uniqueId = `passage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await executeWithRetry(async () => {
      return await db.run(`
        INSERT INTO passages_directs (
          id, nom_prenom, date, heure, motif, statut, telephone, age
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uniqueId,
        nomPrenom,
        date,
        heure,
        motif,
        statut || 'en attente',
        telephone,
        age
      ]);
    });
    
    const newPassage = await db.get('SELECT * FROM passages_directs WHERE id = ?', uniqueId);
    
    console.log('✅ Passage direct created:', newPassage.id);
    
    res.status(201).json({
      id: newPassage.id,
      nomPrenom: newPassage.nom_prenom,
      date: newPassage.date,
      heure: newPassage.heure,
      motif: newPassage.motif,
      statut: newPassage.statut,
      telephone: newPassage.telephone,
      age: newPassage.age
    });
  } catch (error) {
    console.error('❌ Error creating passage direct:', error);
    console.error('❌ SQL Error Details:', error.message);
    console.error('❌ Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ 
      error: 'Failed to create passage direct', 
      details: error.message,
      sqlError: error.code 
    });
  }
});

// PUT update passage direct
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const passage = await db.get('SELECT * FROM passages_directs WHERE id = ?', req.params.id);
    
    if (!passage) {
      return res.status(404).json({ error: 'Passage direct not found' });
    }
    
    const {
      nomPrenom,
      date,
      heure,
      motif,
      statut,
      telephone,
      age
    } = req.body;
    
    await db.run(`
      UPDATE passages_directs SET
        nom_prenom = ?,
        date = ?,
        heure = ?,
        motif = ?,
        statut = ?,
        telephone = ?,
        age = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      nomPrenom || passage.nom_prenom,
      date || passage.date,
      heure || passage.heure,
      motif || passage.motif,
      statut || passage.statut,
      telephone || passage.telephone,
      age !== undefined ? age : passage.age,
      req.params.id
    ]);
    
    const updated = await db.get('SELECT * FROM passages_directs WHERE id = ?', req.params.id);
    
    res.json({
      id: updated.id,
      nomPrenom: updated.nom_prenom,
      date: updated.date,
      heure: updated.heure,
      motif: updated.motif,
      statut: updated.statut,
      telephone: updated.telephone,
      age: updated.age
    });
  } catch (error) {
    console.error('Error updating passage direct:', error);
    res.status(500).json({ error: 'Failed to update passage direct' });
  }
});

// DELETE passage direct
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const passage = await db.get('SELECT * FROM passages_directs WHERE id = ?', req.params.id);
    
    if (!passage) {
      return res.status(404).json({ error: 'Passage direct not found' });
    }
    
    await db.run('DELETE FROM passages_directs WHERE id = ?', req.params.id);
    
    res.json({ message: 'Passage direct deleted successfully' });
  } catch (error) {
    console.error('Error deleting passage direct:', error);
    res.status(500).json({ error: 'Failed to delete passage direct' });
  }
});

export default router;
