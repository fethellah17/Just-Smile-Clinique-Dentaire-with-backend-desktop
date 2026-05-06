# Dental Clinic API

Backend API for the dental clinic management system using Express.js and SQLite.

## Database Structure

The database supports hierarchical relationships:
- **Categories** (e.g., Chirurgie, Prothèse Fixe)
  - **Category Types** (e.g., Extraction simple, Bridge)
    - **Type Steps** (e.g., Consultation, Radiographie)
  - **Category Stages** (general workflow stages)

## Setup

1. Install dependencies (pure Node.js, no C++ compilation required):
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

This will create `dental-clinic.db` and seed it with the initial categories data.

**Note:** This project uses `sqlite3` and `sqlite` (async wrapper) which are pure JavaScript implementations that work on Windows without requiring Visual Studio or C++ Build Tools.

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server runs on `http://localhost:3000` by default.

## API Endpoints

### Categories

- `GET /api/categories` - Get all categories with types, steps, and stages
- `GET /api/categories/:id` - Get a single category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Example Requests

**Get all categories:**
```bash
curl http://localhost:3000/api/categories
```

**Create a new category:**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "id": "7",
    "name": "Pédodontie",
    "icon": "Baby",
    "color": "#10B981",
    "types": [
      {
        "id": "7-1",
        "name": "Soins enfant",
        "steps": [
          {"id": "7-1-s1", "name": "Consultation", "order": 1},
          {"id": "7-1-s2", "name": "Traitement", "order": 2}
        ]
      }
    ],
    "stages": [
      {"id": "7-s1", "name": "Consultation", "order": 1},
      {"id": "7-s2", "name": "Traitement", "order": 2}
    ]
  }'
```

## Database Schema

See `schema.sql` for the complete database structure including:
- categories
- category_types
- type_steps
- category_stages
- patients
- patient_step_completions
- payment_records
- actes
- acte_step_progress
- rendez_vous
- passages_directs

## Technologies

- **Express.js** - Web framework
- **sqlite3** - SQLite database driver (pure JavaScript)
- **sqlite** - Promise-based wrapper for sqlite3 (enables async/await)
- **cors** - CORS middleware

All dependencies are pure Node.js and require no C++ compilation.
