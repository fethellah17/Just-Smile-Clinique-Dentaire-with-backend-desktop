-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Category Types table (hierarchical: belongs to a category)
CREATE TABLE IF NOT EXISTS category_types (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(category_id, name)
);

-- Type Steps table (hierarchical: belongs to a category type)
CREATE TABLE IF NOT EXISTS type_steps (
  id TEXT PRIMARY KEY,
  type_id TEXT NOT NULL,
  name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES category_types(id) ON DELETE CASCADE
);

-- Category Stages table (general stages for a category)
CREATE TABLE IF NOT EXISTS category_stages (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  age INTEGER,
  telephone TEXT,
  antecedents TEXT,
  categorie TEXT,
  type_soin TEXT,
  type_soin_id TEXT,
  etape_actuelle TEXT,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  montant_total REAL DEFAULT 0,
  montant_paye REAL DEFAULT 0,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patient Step Completions table
CREATE TABLE IF NOT EXISTS patient_step_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  completed_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Payment Records table
CREATE TABLE IF NOT EXISTS payment_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  amount REAL NOT NULL,
  date DATETIME NOT NULL,
  notes TEXT,
  locked INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Actes table
CREATE TABLE IF NOT EXISTS actes (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  type TEXT NOT NULL,
  type_id TEXT NOT NULL,
  categorie TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  stage TEXT,
  montant_total REAL DEFAULT 0,
  montant_verse REAL DEFAULT 0,
  reste_a_payer REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Acte Step Progress table
CREATE TABLE IF NOT EXISTS acte_step_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  acte_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (acte_id) REFERENCES actes(id) ON DELETE CASCADE
);

-- Rendez-vous table
CREATE TABLE IF NOT EXISTS rendez_vous (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_nom TEXT NOT NULL,
  nom TEXT,
  prenom TEXT,
  date DATE NOT NULL,
  heure TEXT NOT NULL,
  motif TEXT NOT NULL,
  statut TEXT CHECK(statut IN ('confirmé', 'en attente', 'annulé')) DEFAULT 'en attente',
  telephone TEXT,
  age INTEGER,
  archived INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

-- Passages Directs table
CREATE TABLE IF NOT EXISTS passages_directs (
  id TEXT PRIMARY KEY,
  nom_prenom TEXT NOT NULL,
  date DATE NOT NULL,
  heure TEXT NOT NULL,
  motif TEXT NOT NULL,
  statut TEXT CHECK(statut IN ('en attente', 'passé', 'annulé')) DEFAULT 'en attente',
  telephone TEXT,
  age INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_category_types_category ON category_types(category_id);
CREATE INDEX IF NOT EXISTS idx_type_steps_type ON type_steps(type_id);
CREATE INDEX IF NOT EXISTS idx_category_stages_category ON category_stages(category_id);
CREATE INDEX IF NOT EXISTS idx_patient_steps_patient ON patient_step_completions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_patient ON payment_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_actes_patient ON actes(patient_id);
CREATE INDEX IF NOT EXISTS idx_actes_category ON actes(category_id);
CREATE INDEX IF NOT EXISTS idx_acte_progress_acte ON acte_step_progress(acte_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient ON rendez_vous(patient_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date);
