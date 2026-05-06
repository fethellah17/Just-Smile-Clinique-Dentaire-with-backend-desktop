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

// GET all rendez-vous (ONLY non-archived, archived = 0)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    
    console.log('📋 Fetching ACTIVE appointments (archived = 0)');
    
    // STRICT: return only non-archived appointments (archived = 0)
    const rendezVous = await db.all(
      'SELECT * FROM rendez_vous WHERE archived = 0 ORDER BY date ASC, heure ASC'
    );
    
    const result = rendezVous.map(rdv => ({
      id: rdv.id,
      patientId: rdv.patient_id,
      patientNom: rdv.patient_nom,
      nom: rdv.nom,
      prenom: rdv.prenom,
      date: rdv.date,
      heure: rdv.heure,
      motif: rdv.motif,
      statut: rdv.statut,
      telephone: rdv.telephone,
      age: rdv.age,
      archived: rdv.archived === 1
    }));
    
    console.log(`✅ Returned ${result.length} active appointments`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching rendez-vous:', error);
    res.status(500).json({ error: 'Failed to fetch rendez-vous' });
  }
});

// GET history - ONLY archived appointments (archived = 1) - MUST be before /:id route
router.get('/history', async (req, res) => {
  try {
    const db = await getDb();
    
    console.log('📚 Fetching ARCHIVED appointments (archived = 1)');
    
    // STRICT: return only archived appointments (archived = 1)
    const rendezVous = await db.all(
      'SELECT * FROM rendez_vous WHERE archived = 1 ORDER BY date DESC, heure DESC'
    );
    
    const result = rendezVous.map(rdv => ({
      id: rdv.id,
      patientId: rdv.patient_id,
      patientNom: rdv.patient_nom,
      nom: rdv.nom,
      prenom: rdv.prenom,
      date: rdv.date,
      heure: rdv.heure,
      motif: rdv.motif,
      statut: rdv.statut,
      telephone: rdv.telephone,
      age: rdv.age,
      archived: rdv.archived === 1
    }));
    
    console.log(`✅ Returned ${result.length} archived appointments`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// PUT archive all completed appointments for a specific date
router.put('/archive-day', async (req, res) => {
  try {
    const db = await getDb();
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Missing required field: date' });
    }
    
    console.log('📦 Archiving completed appointments for date:', date);
    
    // Only archive appointments that are confirmed or cancelled (not pending)
    const result = await executeWithRetry(async () => {
      return await db.run(
        `UPDATE rendez_vous 
         SET archived = 1, updated_at = CURRENT_TIMESTAMP 
         WHERE date = ? AND archived = 0 AND statut IN ('confirmé', 'annulé')`,
        date
      );
    });
    
    console.log('✅ Archived', result.changes, 'appointments for', date);
    
    res.json({ 
      message: 'Appointments archived successfully',
      count: result.changes,
      date 
    });
  } catch (error) {
    console.error('Error archiving appointments:', error);
    res.status(500).json({ error: 'Failed to archive appointments' });
  }
});

// GET single rendez-vous by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const rdv = await db.get('SELECT * FROM rendez_vous WHERE id = ?', req.params.id);
    
    if (!rdv) {
      return res.status(404).json({ error: 'Rendez-vous not found' });
    }
    
    res.json({
      id: rdv.id,
      patientId: rdv.patient_id,
      patientNom: rdv.patient_nom,
      nom: rdv.nom,
      prenom: rdv.prenom,
      date: rdv.date,
      heure: rdv.heure,
      motif: rdv.motif,
      statut: rdv.statut,
      telephone: rdv.telephone,
      age: rdv.age,
      archived: rdv.archived === 1
    });
  } catch (error) {
    console.error('Error fetching rendez-vous:', error);
    res.status(500).json({ error: 'Failed to fetch rendez-vous' });
  }
});

// POST create new rendez-vous
router.post('/', async (req, res) => {
  try {
    console.log('🔍 DEBUG BACKEND - RECEIVED DATA:', JSON.stringify(req.body, null, 2));
    
    const db = await getDb();
    const {
      patientId,
      patientNom,
      nom,
      prenom,
      date,
      heure,
      motif,
      statut,
      telephone,
      age
    } = req.body;
    
    console.log('📝 Creating rendez-vous:', { patientNom, date, heure, motif });
    
    if (!date || !heure || !motif) {
      console.error('❌ Missing required fields:', { date, heure, motif });
      return res.status(400).json({ error: 'Missing required fields: date, heure, motif' });
    }
    
    if (!patientNom) {
      console.error('❌ Missing patientNom');
      return res.status(400).json({ error: 'Missing required field: patientNom' });
    }
    
    // STRICT duplicate check: prevent exact same appointment (name, date, time)
    const existingAppointment = await db.get(`
      SELECT id FROM rendez_vous 
      WHERE patient_nom = ? 
        AND date = ? 
        AND heure = ?
        AND archived = 0
    `, [patientNom, date, heure]);
    
    if (existingAppointment) {
      console.log('⚠️ Duplicate detected - same patient, date, and time:', existingAppointment.id);
      const existing = await db.get('SELECT * FROM rendez_vous WHERE id = ?', existingAppointment.id);
      return res.status(409).json({
        error: 'Duplicate appointment',
        message: 'Un rendez-vous existe déjà pour ce patient à cette date et heure',
        existing: {
          id: existing.id,
          patientId: existing.patient_id,
          patientNom: existing.patient_nom,
          nom: existing.nom,
          prenom: existing.prenom,
          date: existing.date,
          heure: existing.heure,
          motif: existing.motif,
          statut: existing.statut,
          telephone: existing.telephone,
          age: existing.age,
          archived: existing.archived === 1
        }
      });
    }
    
    // Handle patient_id: only use if explicitly provided
    let patientIdValue = patientId && patientId.trim() !== '' ? patientId : null;
    
    // DO NOT auto-create patients - they should only be created when appointment is confirmed
    console.log('📝 Patient ID:', patientIdValue || 'None (pending appointment)');
    
    // Generate unique ID using timestamp + random
    const uniqueId = `rdv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await executeWithRetry(async () => {
      return await db.run(`
        INSERT INTO rendez_vous (
          id, patient_id, patient_nom, nom, prenom, date, heure, motif, statut, telephone, age, archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        uniqueId,
        patientIdValue,
        patientNom,
        nom,
        prenom,
        date,
        heure,
        motif,
        statut || 'en attente',
        telephone,
        age
      ]);
    });
    
    const newRdv = await db.get('SELECT * FROM rendez_vous WHERE id = ?', uniqueId);
    
    console.log('✅ Rendez-vous created:', newRdv.id);
    
    res.status(201).json({
      id: newRdv.id,
      patientId: newRdv.patient_id,
      patientNom: newRdv.patient_nom,
      nom: newRdv.nom,
      prenom: newRdv.prenom,
      date: newRdv.date,
      heure: newRdv.heure,
      motif: newRdv.motif,
      statut: newRdv.statut,
      telephone: newRdv.telephone,
      age: newRdv.age,
      archived: newRdv.archived === 1
    });
  } catch (error) {
    console.error('❌ Error creating rendez-vous:', error);
    console.error('❌ SQL Error Details:', error.message);
    console.error('❌ Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ 
      error: 'Failed to create rendez-vous', 
      details: error.message,
      sqlError: error.code 
    });
  }
});

// PUT update rendez-vous
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const rdv = await db.get('SELECT * FROM rendez_vous WHERE id = ?', req.params.id);
    
    if (!rdv) {
      return res.status(404).json({ error: 'Rendez-vous not found' });
    }
    
    const {
      patientId,
      patientNom,
      nom,
      prenom,
      date,
      heure,
      motif,
      statut,
      telephone,
      age,
      archived
    } = req.body;
    
    await db.run(`
      UPDATE rendez_vous SET
        patient_id = ?,
        patient_nom = ?,
        nom = ?,
        prenom = ?,
        date = ?,
        heure = ?,
        motif = ?,
        statut = ?,
        telephone = ?,
        age = ?,
        archived = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      patientId !== undefined ? patientId : rdv.patient_id,
      patientNom || rdv.patient_nom,
      nom || rdv.nom,
      prenom || rdv.prenom,
      date || rdv.date,
      heure || rdv.heure,
      motif || rdv.motif,
      statut || rdv.statut,
      telephone || rdv.telephone,
      age !== undefined ? age : rdv.age,
      archived !== undefined ? (archived ? 1 : 0) : rdv.archived,
      req.params.id
    ]);
    
    const updated = await db.get('SELECT * FROM rendez_vous WHERE id = ?', req.params.id);
    
    res.json({
      id: updated.id,
      patientId: updated.patient_id,
      patientNom: updated.patient_nom,
      nom: updated.nom,
      prenom: updated.prenom,
      date: updated.date,
      heure: updated.heure,
      motif: updated.motif,
      statut: updated.statut,
      telephone: updated.telephone,
      age: updated.age,
      archived: updated.archived === 1
    });
  } catch (error) {
    console.error('Error updating rendez-vous:', error);
    res.status(500).json({ error: 'Failed to update rendez-vous' });
  }
});

// DELETE rendez-vous
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const rdv = await db.get('SELECT * FROM rendez_vous WHERE id = ?', req.params.id);
    
    if (!rdv) {
      return res.status(404).json({ error: 'Rendez-vous not found' });
    }
    
    await db.run('DELETE FROM rendez_vous WHERE id = ?', req.params.id);
    
    res.json({ message: 'Rendez-vous deleted successfully' });
  } catch (error) {
    console.error('Error deleting rendez-vous:', error);
    res.status(500).json({ error: 'Failed to delete rendez-vous' });
  }
});

// GET dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    
    const totalPatients = await db.get('SELECT COUNT(*) as count FROM patients');
    const todayAppointments = await db.get(
      'SELECT COUNT(*) as count FROM rendez_vous WHERE date = ? AND archived = 0',
      today
    );
    const pendingAppointments = await db.get(
      "SELECT COUNT(*) as count FROM rendez_vous WHERE statut = 'en attente' AND archived = 0"
    );
    const confirmedAppointments = await db.get(
      "SELECT COUNT(*) as count FROM rendez_vous WHERE statut = 'confirmé' AND archived = 0"
    );
    
    res.json({
      totalPatients: totalPatients.count,
      todayAppointments: todayAppointments.count,
      pendingAppointments: pendingAppointments.count,
      confirmedAppointments: confirmedAppointments.count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
