import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkAppointments() {
  const db = await open({
    filename: './dental-clinic.db',
    driver: sqlite3.Database
  });

  console.log('📊 Current Appointments Summary\n');
  
  const summary = await db.all(`
    SELECT date, statut, archived, COUNT(*) as count 
    FROM rendez_vous 
    GROUP BY date, statut, archived 
    ORDER BY date
  `);
  
  console.log('Date       | Status       | Archived | Count');
  console.log('-----------|--------------|----------|------');
  summary.forEach(r => {
    console.log(`${r.date} | ${r.statut.padEnd(12)} | ${r.archived === 1 ? 'Yes     ' : 'No      '} | ${r.count}`);
  });
  
  console.log('\n📋 Detailed Breakdown:\n');
  
  const active = await db.get('SELECT COUNT(*) as count FROM rendez_vous WHERE archived = 0');
  const archived = await db.get('SELECT COUNT(*) as count FROM rendez_vous WHERE archived = 1');
  const pending = await db.get('SELECT COUNT(*) as count FROM rendez_vous WHERE archived = 0 AND statut = "en attente"');
  const confirmed = await db.get('SELECT COUNT(*) as count FROM rendez_vous WHERE archived = 0 AND statut = "confirmé"');
  const cancelled = await db.get('SELECT COUNT(*) as count FROM rendez_vous WHERE archived = 0 AND statut = "annulé"');
  
  console.log(`Active appointments:    ${active.count}`);
  console.log(`  - Pending:            ${pending.count}`);
  console.log(`  - Confirmed:          ${confirmed.count}`);
  console.log(`  - Cancelled:          ${cancelled.count}`);
  console.log(`Archived appointments:  ${archived.count}`);
  
  await db.close();
}

checkAppointments();
