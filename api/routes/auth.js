import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Update password endpoint
router.put('/update-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [hashedNewPassword, email]
    );

    console.log(`✓ Mot de passe mis à jour pour: ${email}`);
    res.json({ success: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Password reset endpoint with recovery code
router.post('/reset-password', async (req, res) => {
  const { email, recoveryCode } = req.body;

  if (!email || !recoveryCode) {
    return res.status(400).json({ error: "Email et code de récupération requis" });
  }

  // Validate recovery code
  if (recoveryCode.trim().toUpperCase() !== "JUST-SMILE-2026") {
    return res.status(401).json({ error: "Code de récupération incorrect" });
  }

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    if (!user) {
      // User doesn't exist, create them with default password
      await db.run(
        'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
        ['user-1', email, hashedPassword, 'Dr. Souidi']
      );

      console.log(`✓ Utilisateur créé avec mot de passe par défaut: ${email}`);
      res.json({ 
        success: true, 
        message: "Utilisateur créé avec mot de passe 'admin123'",
        defaultPassword: defaultPassword
      });
    } else {
      // User exists, reset their password
      await db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
        [hashedPassword, email]
      );

      console.log(`✓ Mot de passe réinitialisé pour: ${email}`);
      res.json({ 
        success: true, 
        message: "Mot de passe réinitialisé à 'admin123'",
        defaultPassword: defaultPassword
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
