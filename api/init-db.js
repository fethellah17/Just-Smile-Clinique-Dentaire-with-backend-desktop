import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  let db;
  
  try {
    // Open database connection
    db = await open({
      filename: './dental-clinic.db',
      driver: sqlite3.Database
    });

    console.log('✓ Database connection established');

    // CRITICAL: Enable foreign keys (required for CASCADE to work)
    await db.exec('PRAGMA foreign_keys = ON');
    console.log('✓ Foreign keys enabled');

    // Read and execute schema
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await db.exec(schema);

    console.log('✓ Database schema created');

    // Check if data already exists
    const existingCategories = await db.get('SELECT COUNT(*) as count FROM categories');
    
    if (existingCategories.count > 0) {
      console.log('⚠ Database already contains data. Skipping seed.');
      await db.close();
      console.log('✓ Database initialized successfully!');
      return;
    }

    // Seed initial categories data
    console.log('Seeding database with initial data...');

    const categories = [
      {
        id: "1",
        name: "Chirurgie",
        icon: "Scissors",
        color: "#6B7280",
        types: [
          { 
            id: "1-1", 
            name: "Extraction simple",
            steps: [
              { id: "1-1-s1", name: "Consultation initiale", order: 1 },
              { id: "1-1-s2", name: "Radiographie", order: 2 },
              { id: "1-1-s3", name: "Extraction", order: 3 },
              { id: "1-1-s4", name: "Contrôle post-opératoire", order: 4 },
            ]
          },
          { 
            id: "1-2", 
            name: "Extraction complexe",
            steps: [
              { id: "1-2-s1", name: "Consultation initiale", order: 1 },
              { id: "1-2-s2", name: "Scanner 3D", order: 2 },
              { id: "1-2-s3", name: "Préparation chirurgicale", order: 3 },
              { id: "1-2-s4", name: "Extraction", order: 4 },
              { id: "1-2-s5", name: "Suivi J+3", order: 5 },
              { id: "1-2-s6", name: "Suivi J+7", order: 6 },
            ]
          },
          { 
            id: "1-3", 
            name: "Implant",
            steps: [
              { id: "1-3-s1", name: "Consultation", order: 1 },
              { id: "1-3-s2", name: "Scanner 3D", order: 2 },
              { id: "1-3-s3", name: "Pose implant", order: 3 },
              { id: "1-3-s4", name: "Ostéointégration (3-6 mois)", order: 4 },
              { id: "1-3-s5", name: "Pose pilier", order: 5 },
              { id: "1-3-s6", name: "Empreinte couronne", order: 6 },
              { id: "1-3-s7", name: "Pose couronne", order: 7 },
            ]
          },
        ],
        stages: [
          { id: "1-s1", name: "Consultation", order: 1 },
          { id: "1-s2", name: "Radiographie", order: 2 },
          { id: "1-s3", name: "Intervention", order: 3 },
          { id: "1-s4", name: "Suivi post-op", order: 4 },
        ],
      },
      {
        id: "2",
        name: "Prothèse Fixe",
        icon: "Wrench",
        color: "#6B7280",
        types: [
          { 
            id: "2-1", 
            name: "Bridge",
            steps: [
              { id: "2-1-s1", name: "Consultation", order: 1 },
              { id: "2-1-s2", name: "Taillage des piliers", order: 2 },
              { id: "2-1-s3", name: "Empreinte", order: 3 },
              { id: "2-1-s4", name: "Essai infrastructure", order: 4 },
              { id: "2-1-s5", name: "Essai céramique", order: 5 },
              { id: "2-1-s6", name: "Pose définitive", order: 6 },
            ]
          },
          { 
            id: "2-2", 
            name: "Couronne",
            steps: [
              { id: "2-2-s1", name: "Consultation", order: 1 },
              { id: "2-2-s2", name: "Taillage", order: 2 },
              { id: "2-2-s3", name: "Empreinte", order: 3 },
              { id: "2-2-s4", name: "Essai", order: 4 },
              { id: "2-2-s5", name: "Pose", order: 5 },
            ]
          },
          { 
            id: "2-3", 
            name: "Inlay/Onlay",
            steps: [
              { id: "2-3-s1", name: "Consultation", order: 1 },
              { id: "2-3-s2", name: "Préparation cavité", order: 2 },
              { id: "2-3-s3", name: "Empreinte", order: 3 },
              { id: "2-3-s4", name: "Collage", order: 4 },
            ]
          },
        ],
        stages: [
          { id: "2-s1", name: "Consultation", order: 1 },
          { id: "2-s2", name: "Préparation", order: 2 },
          { id: "2-s3", name: "Empreinte", order: 3 },
          { id: "2-s4", name: "Essayage", order: 4 },
          { id: "2-s5", name: "Pose", order: 5 },
        ],
      },
      {
        id: "3",
        name: "Prothèse Amovible",
        icon: "Smile",
        color: "#6B7280",
        types: [
          { 
            id: "3-1", 
            name: "Dentier complet",
            steps: [
              { id: "3-1-s1", name: "Consultation", order: 1 },
              { id: "3-1-s2", name: "Empreinte primaire", order: 2 },
              { id: "3-1-s3", name: "Empreinte secondaire", order: 3 },
              { id: "3-1-s4", name: "Essai cire", order: 4 },
              { id: "3-1-s5", name: "Livraison", order: 5 },
              { id: "3-1-s6", name: "Ajustements", order: 6 },
            ]
          },
          { 
            id: "3-2", 
            name: "Dentier partiel",
            steps: [
              { id: "3-2-s1", name: "Consultation", order: 1 },
              { id: "3-2-s2", name: "Empreinte", order: 2 },
              { id: "3-2-s3", name: "Essai armature", order: 3 },
              { id: "3-2-s4", name: "Essai cire", order: 4 },
              { id: "3-2-s5", name: "Livraison", order: 5 },
            ]
          },
          { 
            id: "3-3", 
            name: "Gouttière",
            steps: [
              { id: "3-3-s1", name: "Consultation", order: 1 },
              { id: "3-3-s2", name: "Empreinte", order: 2 },
              { id: "3-3-s3", name: "Livraison", order: 3 },
            ]
          },
        ],
        stages: [
          { id: "3-s1", name: "Consultation", order: 1 },
          { id: "3-s2", name: "Empreinte", order: 2 },
          { id: "3-s3", name: "Essayage", order: 3 },
          { id: "3-s4", name: "Pose", order: 4 },
        ],
      },
      {
        id: "4",
        name: "Soins Esthétiques",
        icon: "Sparkles",
        color: "#6B7280",
        types: [
          { 
            id: "4-1", 
            name: "Blanchiment",
            steps: [
              { id: "4-1-s1", name: "Consultation", order: 1 },
              { id: "4-1-s2", name: "Détartrage préalable", order: 2 },
              { id: "4-1-s3", name: "Séance blanchiment", order: 3 },
              { id: "4-1-s4", name: "Contrôle", order: 4 },
            ]
          },
          { 
            id: "4-2", 
            name: "Facette",
            steps: [
              { id: "4-2-s1", name: "Consultation", order: 1 },
              { id: "4-2-s2", name: "Préparation", order: 2 },
              { id: "4-2-s3", name: "Empreinte", order: 3 },
              { id: "4-2-s4", name: "Essai", order: 4 },
              { id: "4-2-s5", name: "Collage", order: 5 },
            ]
          },
          { 
            id: "4-3", 
            name: "Détartrage",
            steps: [
              { id: "4-3-s1", name: "Détartrage", order: 1 },
              { id: "4-3-s2", name: "Polissage", order: 2 },
            ]
          },
        ],
        stages: [
          { id: "4-s1", name: "Consultation", order: 1 },
          { id: "4-s2", name: "Traitement", order: 2 },
          { id: "4-s3", name: "Suivi", order: 3 },
        ],
      },
      {
        id: "5",
        name: "Orthodontie",
        icon: "Ruler",
        color: "#6B7280",
        types: [
          { 
            id: "5-1", 
            name: "Appareil amovible",
            steps: [
              { id: "5-1-s1", name: "Consultation", order: 1 },
              { id: "5-1-s2", name: "Empreinte primaire", order: 2 },
              { id: "5-1-s3", name: "Empreinte secondaire", order: 3 },
              { id: "5-1-s4", name: "Essai cire", order: 4 },
              { id: "5-1-s5", name: "Livraison", order: 5 },
              { id: "5-1-s6", name: "Suivi mensuel", order: 6 },
            ]
          },
          { 
            id: "5-2", 
            name: "Brackets",
            steps: [
              { id: "5-2-s1", name: "Consultation", order: 1 },
              { id: "5-2-s2", name: "Empreinte", order: 2 },
              { id: "5-2-s3", name: "Pose brackets", order: 3 },
              { id: "5-2-s4", name: "Suivi mensuel", order: 4 },
              { id: "5-2-s5", name: "Dépose", order: 5 },
              { id: "5-2-s6", name: "Contention", order: 6 },
            ]
          },
          { 
            id: "5-3", 
            name: "Gouttière invisible",
            steps: [
              { id: "5-3-s1", name: "Consultation", order: 1 },
              { id: "5-3-s2", name: "Empreinte numérique", order: 2 },
              { id: "5-3-s3", name: "Livraison gouttières", order: 3 },
              { id: "5-3-s4", name: "Suivi mensuel", order: 4 },
              { id: "5-3-s5", name: "Fin traitement", order: 5 },
            ]
          },
        ],
        stages: [
          { id: "5-s1", name: "Consultation", order: 1 },
          { id: "5-s2", name: "Empreinte", order: 2 },
          { id: "5-s3", name: "Pose", order: 3 },
          { id: "5-s4", name: "Suivi mensuel", order: 4 },
          { id: "5-s5", name: "Dépose", order: 5 },
        ],
      },
      {
        id: "6",
        name: "Soins de base",
        icon: "Stethoscope",
        color: "#6B7280",
        types: [
          { 
            id: "6-1", 
            name: "Détartrage",
            steps: [
              { id: "6-1-s1", name: "Détartrage", order: 1 },
              { id: "6-1-s2", name: "Polissage", order: 2 },
            ]
          },
          { 
            id: "6-2", 
            name: "Plombage",
            steps: [
              { id: "6-2-s1", name: "Examen", order: 1 },
              { id: "6-2-s2", name: "Anesthésie", order: 2 },
              { id: "6-2-s3", name: "Curetage", order: 3 },
              { id: "6-2-s4", name: "Obturation", order: 4 },
            ]
          },
          { 
            id: "6-3", 
            name: "Nettoyage",
            steps: [
              { id: "6-3-s1", name: "Nettoyage", order: 1 },
            ]
          },
        ],
        stages: [
          { id: "6-s1", name: "Examen", order: 1 },
          { id: "6-s2", name: "Traitement", order: 2 },
          { id: "6-s3", name: "Suivi", order: 3 },
        ],
      },
    ];

    // Insert categories with proper async/await
    for (const category of categories) {
      await db.run(
        'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
        [category.id, category.name, category.icon, category.color]
      );
      
      for (const type of category.types) {
        await db.run(
          'INSERT INTO category_types (id, category_id, name) VALUES (?, ?, ?)',
          [type.id, category.id, type.name]
        );
        
        for (const step of type.steps) {
          await db.run(
            'INSERT INTO type_steps (id, type_id, name, step_order) VALUES (?, ?, ?, ?)',
            [step.id, type.id, step.name, step.order]
          );
        }
      }
      
      for (const stage of category.stages) {
        await db.run(
          'INSERT INTO category_stages (id, category_id, name, stage_order) VALUES (?, ?, ?, ?)',
          [stage.id, category.id, stage.name, stage.order]
        );
      }
    }

    console.log('✓ Database seeded with initial categories data');
    
    // Create default user account
    const bcrypt = require('bcrypt');
    const defaultPassword = await bcrypt.hash('admin123', 10);
    
    await db.run(
      'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      ['user-1', 'dr.souidi@justsmile.dz', defaultPassword, 'Dr. Souidi']
    );
    
    console.log('✓ Default user account created (dr.souidi@justsmile.dz / admin123)');
    
    await db.close();
    console.log('✓ Database initialized successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    if (db) await db.close();
    process.exit(1);
  }
}

initializeDatabase();
