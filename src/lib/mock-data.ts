export interface StepCompletion {
  stepId: string;
  stepName: string;
  completedAt: string; // ISO timestamp
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string; // ISO timestamp
  notes?: string;
  locked: boolean; // Immutable once saved
}

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  telephone: string;
  antecedents: string;
  categorie: string;
  typeSoin?: string;
  typeSoinId?: string;
  etapeActuelle?: string;
  stepsCompleted: StepCompletion[];
  dateCreation: string;
  montantTotal: number; // Total treatment cost
  montantPaye: number; // Total paid
  paymentHistory: PaymentRecord[]; // Audit log of all payments
  clinicalNotes?: string; // Clinical notes for the patient
}

export interface TypeStep {
  id: string;
  name: string;
  order: number;
}

export interface CategoryType {
  id: string;
  name: string;
  steps: TypeStep[];
}

export interface CategoryStage {
  id: string;
  name: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string;
  types: CategoryType[];
  stages: CategoryStage[];
}

export interface ActeStepProgress {
  stepId: string;
  stepName: string;
  completed: boolean;
  completedDate?: string;
}

export interface Acte {
  id: string;
  patientId: string;
  type: string;
  typeId: string;
  categorie: string;
  categoryId: string;
  description: string;
  date: string;
  stage?: string;
  stepProgress: ActeStepProgress[];
  montantTotal: number;
  montantVerse: number;
  resteAPayer: number;
}

export interface RendezVous {
  id: string;
  patientId: string;
  patientNom: string;
  nom?: string;
  prenom?: string;
  date: string;
  heure: string;
  motif: string;
  statut: "confirmé" | "en attente" | "annulé";
  telephone?: string;
  age?: number;
  archived?: boolean;
}

export interface PassageDirect {
  id: string;
  nomPrenom: string;
  date: string;
  heure: string;
  motif: string;
  statut: "en attente" | "passé" | "annulé";
  telephone?: string;
  age?: number;
}

export const patients: Patient[] = [
  { id: "1", nom: "Benali", prenom: "Fatima", age: 34, telephone: "0551234567", antecedents: "Diabète type 2", categorie: "Soins de base", typeSoin: "Détartrage", typeSoinId: "6-1", etapeActuelle: "Polissage", stepsCompleted: [{ stepId: "6-1-s1", stepName: "Détartrage", completedAt: "2024-06-01T09:30:00Z" }], dateCreation: "2024-01-15", montantTotal: 5000, montantPaye: 5000, paymentHistory: [{ id: "p1-1", amount: 5000, date: "2024-06-01T09:30:00Z", locked: true }] },
  { id: "2", nom: "Khelifi", prenom: "Ahmed", age: 45, telephone: "0662345678", antecedents: "Hypertension", categorie: "Prothèse Fixe", typeSoin: "Bridge", typeSoinId: "2-1", etapeActuelle: "Essai infrastructure", stepsCompleted: [{ stepId: "2-1-s1", stepName: "Consultation", completedAt: "2024-06-05T10:00:00Z" }, { stepId: "2-1-s2", stepName: "Taillage des piliers", completedAt: "2024-06-12T14:30:00Z" }, { stepId: "2-1-s3", stepName: "Empreinte", completedAt: "2024-06-19T11:00:00Z" }], dateCreation: "2024-02-20", montantTotal: 45000, montantPaye: 20000, paymentHistory: [{ id: "p2-1", amount: 10000, date: "2024-06-05T10:00:00Z", locked: true }, { id: "p2-2", amount: 10000, date: "2024-06-12T14:30:00Z", locked: true }] },
  { id: "3", nom: "Boumediene", prenom: "Sara", age: 28, telephone: "0773456789", antecedents: "Aucun", categorie: "Soins Esthétiques", typeSoin: "Blanchiment", typeSoinId: "4-1", etapeActuelle: "Contrôle", stepsCompleted: [{ stepId: "4-1-s1", stepName: "Consultation", completedAt: "2024-06-10T09:00:00Z" }, { stepId: "4-1-s2", stepName: "Détartrage préalable", completedAt: "2024-06-10T09:30:00Z" }, { stepId: "4-1-s3", stepName: "Séance blanchiment", completedAt: "2024-06-17T15:00:00Z" }], dateCreation: "2024-03-10", montantTotal: 15000, montantPaye: 15000, paymentHistory: [{ id: "p3-1", amount: 15000, date: "2024-06-17T15:00:00Z", locked: true }] },
  { id: "4", nom: "Messaoudi", prenom: "Karim", age: 52, telephone: "0554567890", antecedents: "Allergie pénicilline", categorie: "Chirurgie", typeSoin: "Extraction simple", typeSoinId: "1-1", etapeActuelle: "Contrôle post-opératoire", stepsCompleted: [{ stepId: "1-1-s1", stepName: "Consultation initiale", completedAt: "2024-06-15T10:00:00Z" }, { stepId: "1-1-s2", stepName: "Radiographie", completedAt: "2024-06-15T10:30:00Z" }, { stepId: "1-1-s3", stepName: "Extraction", completedAt: "2024-06-22T09:00:00Z" }], dateCreation: "2024-04-05", montantTotal: 8000, montantPaye: 3000, paymentHistory: [{ id: "p4-1", amount: 3000, date: "2024-06-15T10:00:00Z", locked: true }] },
  { id: "5", nom: "Zerrouki", prenom: "Amina", age: 38, telephone: "0665678901", antecedents: "Aucun", categorie: "Orthodontie", typeSoin: "Appareil amovible", typeSoinId: "5-1", etapeActuelle: "Empreinte secondaire", stepsCompleted: [{ stepId: "5-1-s1", stepName: "Consultation", completedAt: "2024-07-10T10:00:00Z" }, { stepId: "5-1-s2", stepName: "Empreinte primaire", completedAt: "2024-07-17T14:00:00Z" }], dateCreation: "2024-05-12", montantTotal: 80000, montantPaye: 30000, paymentHistory: [{ id: "p5-1", amount: 15000, date: "2024-07-10T10:00:00Z", locked: true }, { id: "p5-2", amount: 15000, date: "2024-07-17T14:00:00Z", locked: true }] },
];

export const actes: Acte[] = [
  { 
    id: "1", 
    patientId: "1", 
    type: "Détartrage", 
    typeId: "6-1",
    categorie: "Soins de base", 
    categoryId: "6",
    description: "Détartrage complet", 
    date: "2024-06-01", 
    stepProgress: [
      { stepId: "6-1-s1", stepName: "Détartrage", completed: true, completedDate: "2024-06-01" },
      { stepId: "6-1-s2", stepName: "Polissage", completed: true, completedDate: "2024-06-01" },
    ],
    montantTotal: 5000, 
    montantVerse: 5000, 
    resteAPayer: 0 
  },
  { 
    id: "2", 
    patientId: "2", 
    type: "Bridge", 
    typeId: "2-1",
    categorie: "Prothèse Fixe", 
    categoryId: "2",
    description: "Bridge 3 éléments", 
    date: "2024-06-05", 
    stepProgress: [
      { stepId: "2-1-s1", stepName: "Consultation", completed: true, completedDate: "2024-06-05" },
      { stepId: "2-1-s2", stepName: "Taillage des piliers", completed: true, completedDate: "2024-06-12" },
      { stepId: "2-1-s3", stepName: "Empreinte", completed: true, completedDate: "2024-06-19" },
      { stepId: "2-1-s4", stepName: "Essai infrastructure", completed: false },
      { stepId: "2-1-s5", stepName: "Essai céramique", completed: false },
      { stepId: "2-1-s6", stepName: "Pose définitive", completed: false },
    ],
    montantTotal: 45000, 
    montantVerse: 20000, 
    resteAPayer: 25000 
  },
  { 
    id: "3", 
    patientId: "3", 
    type: "Blanchiment", 
    typeId: "4-1",
    categorie: "Soins Esthétiques", 
    categoryId: "4",
    description: "Blanchiment au laser", 
    date: "2024-06-10", 
    stepProgress: [
      { stepId: "4-1-s1", stepName: "Consultation", completed: true, completedDate: "2024-06-10" },
      { stepId: "4-1-s2", stepName: "Détartrage préalable", completed: true, completedDate: "2024-06-10" },
      { stepId: "4-1-s3", stepName: "Séance blanchiment", completed: true, completedDate: "2024-06-17" },
      { stepId: "4-1-s4", stepName: "Contrôle", completed: true, completedDate: "2024-06-24" },
    ],
    montantTotal: 15000, 
    montantVerse: 15000, 
    resteAPayer: 0 
  },
  { 
    id: "4", 
    patientId: "4", 
    type: "Extraction simple", 
    typeId: "1-1",
    categorie: "Chirurgie", 
    categoryId: "1",
    description: "Extraction dent de sagesse", 
    date: "2024-06-15", 
    stepProgress: [
      { stepId: "1-1-s1", stepName: "Consultation initiale", completed: true, completedDate: "2024-06-15" },
      { stepId: "1-1-s2", stepName: "Radiographie", completed: true, completedDate: "2024-06-15" },
      { stepId: "1-1-s3", stepName: "Extraction", completed: true, completedDate: "2024-06-22" },
      { stepId: "1-1-s4", stepName: "Contrôle post-opératoire", completed: false },
    ],
    montantTotal: 8000, 
    montantVerse: 3000, 
    resteAPayer: 5000 
  },
  { 
    id: "5", 
    patientId: "1", 
    type: "Plombage", 
    typeId: "6-2",
    categorie: "Soins de base", 
    categoryId: "6",
    description: "Plombage composite", 
    date: "2024-07-01", 
    stepProgress: [
      { stepId: "6-2-s1", stepName: "Examen", completed: true, completedDate: "2024-07-01" },
      { stepId: "6-2-s2", stepName: "Anesthésie", completed: true, completedDate: "2024-07-01" },
      { stepId: "6-2-s3", stepName: "Curetage", completed: true, completedDate: "2024-07-01" },
      { stepId: "6-2-s4", stepName: "Obturation", completed: false },
    ],
    montantTotal: 4000, 
    montantVerse: 2000, 
    resteAPayer: 2000 
  },
  { 
    id: "6", 
    patientId: "5", 
    type: "Appareil amovible", 
    typeId: "5-1",
    categorie: "Orthodontie", 
    categoryId: "5",
    description: "Appareil orthodontique", 
    date: "2024-07-10", 
    stepProgress: [
      { stepId: "5-1-s1", stepName: "Consultation", completed: true, completedDate: "2024-07-10" },
      { stepId: "5-1-s2", stepName: "Empreinte primaire", completed: true, completedDate: "2024-07-17" },
      { stepId: "5-1-s3", stepName: "Empreinte secondaire", completed: false },
      { stepId: "5-1-s4", stepName: "Essai cire", completed: false },
      { stepId: "5-1-s5", stepName: "Livraison", completed: false },
      { stepId: "5-1-s6", stepName: "Suivi mensuel", completed: false },
    ],
    montantTotal: 80000, 
    montantVerse: 30000, 
    resteAPayer: 50000 
  },
];

export const rendezVous: RendezVous[] = [
  { id: "1", patientId: "1", patientNom: "Benali Fatima", date: "2026-04-14", heure: "09:00", motif: "Contrôle", statut: "confirmé" },
  { id: "2", patientId: "2", patientNom: "Khelifi Ahmed", date: "2026-04-14", heure: "10:30", motif: "Suite bridge", statut: "confirmé" },
  { id: "3", patientId: "3", patientNom: "Boumediene Sara", date: "2026-04-14", heure: "14:00", motif: "Détartrage", statut: "en attente" },
  { id: "4", patientId: "5", patientNom: "Zerrouki Amina", date: "2026-04-15", heure: "09:30", motif: "Contrôle ODF", statut: "confirmé" },
  { id: "5", patientId: "4", patientNom: "Messaoudi Karim", date: "2026-04-15", heure: "11:00", motif: "Contrôle post-extraction", statut: "en attente" },
];

export const passagesDirects: PassageDirect[] = [];

export const categories: Category[] = [
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

export const categoryOptions = [
  { label: "Chirurgie & Extractions", value: "Chirurgie" },
  { label: "Bridge céramique & Prothèse Fixe", value: "Prothèse Fixe" },
  { label: "Prothèse Amovible", value: "Prothèse Amovible" },
  { label: "Blanchiment & Soins Esthétiques", value: "Soins Esthétiques" },
  { label: "ODF (Orthodontie)", value: "Orthodontie" },
  { label: "Soins de base", value: "Soins de base" },
];
