import express from 'express';
import getDb from '../db.js';

const router = express.Router();

// GET all patients
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const patients = await db.all(`
      SELECT * FROM patients 
      ORDER BY created_at DESC
    `);
    
    // Get step completions for each patient
    const patientsWithSteps = await Promise.all(patients.map(async (patient) => {
      const steps = await db.all(
        'SELECT * FROM patient_step_completions WHERE patient_id = ?',
        patient.id
      );
      
      const payments = await db.all(
        'SELECT * FROM payment_records WHERE patient_id = ? ORDER BY date DESC',
        patient.id
      );
      
      return {
        id: patient.id,
        nom: patient.nom,
        prenom: patient.prenom,
        age: patient.age,
        telephone: patient.telephone,
        antecedents: patient.antecedents,
        categorie: patient.categorie,
        typeSoin: patient.type_soin,
        typeSoinId: patient.type_soin_id,
        etapeActuelle: patient.etape_actuelle,
        stepsCompleted: steps.map(s => ({
          stepId: s.step_id,
          stepName: s.step_name,
          completedAt: s.completed_at
        })),
        dateCreation: patient.date_creation,
        montantTotal: patient.montant_total || 0,
        montantPaye: patient.montant_paye || 0,
        paymentHistory: payments.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          notes: p.notes,
          locked: p.locked === 1
        })),
        clinicalNotes: patient.clinical_notes
      };
    }));
    
    res.json(patientsWithSteps);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET single patient by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const steps = await db.all(
      'SELECT * FROM patient_step_completions WHERE patient_id = ?',
      patient.id
    );
    
    const payments = await db.all(
      'SELECT * FROM payment_records WHERE patient_id = ? ORDER BY date DESC',
      patient.id
    );
    
    const result = {
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      age: patient.age,
      telephone: patient.telephone,
      antecedents: patient.antecedents,
      categorie: patient.categorie,
      typeSoin: patient.type_soin,
      typeSoinId: patient.type_soin_id,
      etapeActuelle: patient.etape_actuelle,
      stepsCompleted: steps.map(s => ({
        stepId: s.step_id,
        stepName: s.step_name,
        completedAt: s.completed_at
      })),
      dateCreation: patient.date_creation,
      montantTotal: patient.montant_total || 0,
      montantPaye: patient.montant_paye || 0,
      paymentHistory: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        date: p.date,
        notes: p.notes,
        locked: p.locked === 1
      })),
      clinicalNotes: patient.clinical_notes
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST create new patient
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const {
      id,
      nom,
      prenom,
      age,
      telephone,
      antecedents,
      categorie,
      typeSoin,
      typeSoinId,
      etapeActuelle,
      montantTotal,
      montantPaye,
      clinicalNotes
    } = req.body;
    
    if (!nom || !prenom) {
      return res.status(400).json({ error: 'Missing required fields: nom, prenom' });
    }
    
    const dateCreation = new Date().toISOString().split('T')[0];
    
    await db.run(`
      INSERT INTO patients (
        id, nom, prenom, age, telephone, antecedents, categorie,
        type_soin, type_soin_id, etape_actuelle, date_creation,
        montant_total, montant_paye, clinical_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      nom,
      prenom,
      age,
      telephone,
      antecedents,
      categorie,
      typeSoin,
      typeSoinId,
      etapeActuelle,
      dateCreation,
      montantTotal || 0,
      montantPaye || 0,
      clinicalNotes
    ]);
    
    const newPatient = await db.get('SELECT * FROM patients WHERE id = ?', id);
    
    res.status(201).json({
      id: newPatient.id,
      nom: newPatient.nom,
      prenom: newPatient.prenom,
      age: newPatient.age,
      telephone: newPatient.telephone,
      antecedents: newPatient.antecedents,
      categorie: newPatient.categorie,
      typeSoin: newPatient.type_soin,
      typeSoinId: newPatient.type_soin_id,
      etapeActuelle: newPatient.etape_actuelle,
      stepsCompleted: [],
      dateCreation: newPatient.date_creation,
      montantTotal: newPatient.montant_total || 0,
      montantPaye: newPatient.montant_paye || 0,
      paymentHistory: [],
      clinicalNotes: newPatient.clinical_notes
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const {
      nom,
      prenom,
      age,
      telephone,
      antecedents,
      categorie,
      typeSoin,
      typeSoinId,
      etapeActuelle,
      montantTotal,
      montantPaye,
      clinicalNotes,
      stepsCompleted,
      newPayment // New field to track if this is a payment update
    } = req.body;
    
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Check if this is a payment update (montantPaye increased)
      const oldMontantPaye = patient.montant_paye || 0;
      const newMontantPaye = montantPaye !== undefined ? montantPaye : oldMontantPaye;
      const paymentDifference = newMontantPaye - oldMontantPaye;
      
      // If montantPaye increased, create a payment record
      if (paymentDifference > 0) {
        const paymentId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.run(`
          INSERT INTO payment_records (id, patient_id, amount, date, notes, locked)
          VALUES (?, ?, ?, ?, ?, 1)
        `, [
          paymentId,
          req.params.id,
          paymentDifference,
          new Date().toISOString(),
          newPayment?.notes || 'Paiement enregistré'
        ]);
        console.log(`✅ Payment record created: ${paymentDifference} DA`);
      }
      
      // Update patient basic info
      await db.run(`
        UPDATE patients SET
          nom = ?,
          prenom = ?,
          age = ?,
          telephone = ?,
          antecedents = ?,
          categorie = ?,
          type_soin = ?,
          type_soin_id = ?,
          etape_actuelle = ?,
          montant_total = ?,
          montant_paye = ?,
          clinical_notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        nom || patient.nom,
        prenom || patient.prenom,
        age !== undefined ? age : patient.age,
        telephone || patient.telephone,
        antecedents || patient.antecedents,
        categorie || patient.categorie,
        typeSoin || patient.type_soin,
        typeSoinId || patient.type_soin_id,
        etapeActuelle !== undefined ? etapeActuelle : patient.etape_actuelle,
        montantTotal !== undefined ? montantTotal : patient.montant_total,
        newMontantPaye,
        clinicalNotes !== undefined ? clinicalNotes : patient.clinical_notes,
        req.params.id
      ]);
      
      // If stepsCompleted is provided, update the step completions
      if (Array.isArray(stepsCompleted)) {
        console.log(`🔄 Updating step completions for patient ${req.params.id}`);
        console.log(`   New steps to insert: ${stepsCompleted.length}`);
        
        if (stepsCompleted.length === 0) {
          console.log(`   ⚠️  Empty array received - will clear all step completions`);
        }
        
        // Delete existing step completions (always delete first, even if array is empty)
        const deleteResult = await db.run('DELETE FROM patient_step_completions WHERE patient_id = ?', req.params.id);
        console.log(`   ✅ Deleted ${deleteResult.changes} existing step records`);
        
        // Insert new step completions (only if array is not empty)
        if (stepsCompleted.length > 0) {
          for (const step of stepsCompleted) {
            await db.run(`
              INSERT INTO patient_step_completions (patient_id, step_id, step_name, completed_at)
              VALUES (?, ?, ?, ?)
            `, [req.params.id, step.stepId, step.stepName, step.completedAt]);
            console.log(`   ✅ Inserted step: ${step.stepName}`);
          }
        } else {
          console.log(`   ℹ️  No steps to insert (all steps cleared)`);
        }
        
        console.log(`✅ Step completions updated successfully (${stepsCompleted.length} steps)`);
      }
      
      await db.run('COMMIT');
      
      // Fetch updated patient with all related data
      const updated = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
      const steps = await db.all('SELECT * FROM patient_step_completions WHERE patient_id = ?', req.params.id);
      const payments = await db.all('SELECT * FROM payment_records WHERE patient_id = ? ORDER BY date DESC', req.params.id);
      
      res.json({
        id: updated.id,
        nom: updated.nom,
        prenom: updated.prenom,
        age: updated.age,
        telephone: updated.telephone,
        antecedents: updated.antecedents,
        categorie: updated.categorie,
        typeSoin: updated.type_soin,
        typeSoinId: updated.type_soin_id,
        etapeActuelle: updated.etape_actuelle,
        stepsCompleted: steps.map(s => ({
          stepId: s.step_id,
          stepName: s.step_name,
          completedAt: s.completed_at
        })),
        dateCreation: updated.date_creation,
        montantTotal: updated.montant_total || 0,
        montantPaye: updated.montant_paye || 0,
        paymentHistory: payments.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          notes: p.notes,
          locked: p.locked === 1
        })),
        clinicalNotes: updated.clinical_notes
      });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    await db.run('DELETE FROM patients WHERE id = ?', req.params.id);
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;
