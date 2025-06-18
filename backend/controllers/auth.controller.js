const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Costanti di configurazione
const JWT_SECRET = process.env.JWT_SECRET || 'donaction-jwt-secret-key';
const JWT_EXPIRES_IN = '24h';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query per trovare l'utente e il suo ruolo in un'unica operazione con JOIN
    const sql = `
      SELECT u.*, r.nome_ruolo 
      FROM Utente u 
      JOIN Ruolo r ON u.id_ruolo = r.id_ruolo 
      WHERE u.email = ?
    `;
    
    const [users] = await db.execute(sql, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email o password non validi' });
    }
    
    const user = users[0];
    
    // Verifica password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email o password non validi' });
    }
    
    // Crea JWT con informazioni utente e ruolo
    const token = jwt.sign(
      { 
        userId: user.id_utente, 
        email: user.email, 
        role: user.nome_ruolo  // Inserisce il ruolo nel token
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Risposta con token e informazioni utente (esclusa password)
    res.json({
      token,
      user: {
        id: user.id_utente,
        name: user.nome,
        email: user.email,
        role: user.nome_ruolo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Errore durante il login' });
  }
};

// Endpoint dedicato per login admin
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query con filtro sul ruolo admin
    const sql = `
      SELECT u.*, r.nome_ruolo 
      FROM Utente u 
      JOIN Ruolo r ON u.id_ruolo = r.id_ruolo 
      WHERE u.email = ? AND r.nome_ruolo = 'admin'
    `;
    
    const [users] = await db.execute(sql, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Accesso non autorizzato' });
    }
    
    // Resto della logica uguale al login normale...
    const user = users[0];
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email o password non validi' });
    }
    
    const token = jwt.sign(
      { userId: user.id_utente, email: user.email, role: user.nome_ruolo }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id_utente,
        name: user.nome,
        email: user.email,
        role: user.nome_ruolo
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Errore durante il login admin' });
  }
};

// Registrazione con codice admin opzionale
exports.register = async (req, res) => {
  const { nome, email, password, admin_code } = req.body;
  
  try {
    // Verifica se l'email è già registrata
    const [existingUsers] = await db.execute(
      'SELECT * FROM Utente WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email già registrata' });
    }
    
    // Determina il ruolo in base al codice admin
    let roleId = 2; // Default: utente registrato
    
    if (admin_code && admin_code === process.env.ADMIN_SECRET_CODE) {
      roleId = 1; // Admin
    }
    
    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Inserimento nuovo utente
    const [result] = await db.execute(
      'INSERT INTO Utente (nome, email, password_hash, id_ruolo) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, roleId]
    );
    
    // Ottieni il ruolo per includerlo nel token
    const [roles] = await db.execute(
      'SELECT nome_ruolo FROM Ruolo WHERE id_ruolo = ?',
      [roleId]
    );
    
    const role = roles[0].nome_ruolo;
    
    // Crea il JWT
    const token = jwt.sign(
      { userId: result.insertId, email: email, role: role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'Utente registrato con successo',
      token,
      user: {
        id: result.insertId,
        name: nome,
        email: email,
        role: role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
};