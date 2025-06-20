const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const PasswordReset = require('../models/password-reset.model');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurazione di nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Genera token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
};

// Registrazione utente
exports.register = async (req, res) => {
  try {
    const { nome, email, password, admin_code } = req.body;
    const name = nome; // Mappatura del campo nome a name
    
    // Verifica se l'utente esiste già
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }
    
    // Determina il ruolo dell'utente
    let role = 'registered';
    
    // Verifica se è stato fornito un codice di registrazione
    if (admin_code) {
      // Verifica nella tabella registration_codes
      const registrationCode = await User.verifyRegistrationCode(admin_code);
      
      if (registrationCode) {
        role = registrationCode.role; // 'admin' o 'team'
        
        // Segna il codice come utilizzato
        await User.markCodeAsUsed(admin_code);
      } else {
        return res.status(400).json({ message: 'Codice di registrazione non valido.' });
      }    }
    
    // Crea nuovo utente
    const newUser = await User.create({ name, email, password, role });
    
    // Genera token JWT
    const token = generateToken(newUser.id);    res.status(201).json({
      message: 'Utente registrato con successo.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name, // Assicurarsi che venga restituito il campo name
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ message: 'Errore durante la registrazione.' });
  }
};

// Login utente
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verifica se l'utente esiste
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email o password non validi.' });
    }
    
    // Verifica la password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email o password non validi.' });
    }
    
    // Genera token JWT
    const token = generateToken(user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Errore nel login:', error);
    res.status(500).json({ message: 'Errore durante il login.' });
  }
};

// Login admin
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verifica se l'utente esiste
    const user = await User.findByEmail(email);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Accesso admin non autorizzato.' });
    }
    
    // Verifica la password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email o password non validi.' });
    }
    
    // Genera token JWT
    const token = generateToken(user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Errore nel login admin:', error);
    res.status(500).json({ message: 'Errore durante il login admin.' });
  }
};

// Richiesta reset password - nuova versione senza email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verifica se l'utente esiste
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }
    
    // Genera token di reset temporaneo
    const resetToken = await PasswordReset.createToken(user.id);
    
    // Restituisci all'utente il token e l'ID utente
    res.json({ 
      message: 'Email verificata con successo. Procedi con il reset della password.',
      userId: user.id,
      token: resetToken 
    });
  } catch (error) {
    console.error('Errore nella richiesta di reset password:', error);
    res.status(500).json({ message: 'Errore durante la richiesta di reset password.' });
  }
};

// Verifica token reset
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const resetRecord = await PasswordReset.findByToken(token);
    if (!resetRecord) {
      return res.status(400).json({ message: 'Token di reset non valido o scaduto.' });
    }
    
    res.json({ valid: true });
  } catch (error) {
    console.error('Errore nella verifica del token:', error);
    res.status(500).json({ message: 'Errore durante la verifica del token di reset.' });
  }
};

// Reset password - versione aggiornata
exports.resetPassword = async (req, res) => {
  try {
    const { token, userId, newPassword, confirmPassword } = req.body;
    
    // Verifica che le password corrispondano
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Le password non corrispondono.' });
    }
    
    // Verifica che la password rispetti i requisiti di sicurezza
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'La password deve contenere almeno 8 caratteri.' });
    }
    
    // Verifica che il token sia valido e corrisponda all'utente
    const resetRecord = await PasswordReset.findByToken(token);
    if (!resetRecord || resetRecord.user_id != userId) {
      return res.status(400).json({ message: 'Sessione di reset non valida o scaduta.' });
    }
    
    // Aggiorna la password dell'utente
    await User.updatePassword(userId, newPassword);
    
    // Elimina il token di reset
    await PasswordReset.deleteToken(token);
    
    res.json({ message: 'Password aggiornata con successo.' });
  } catch (error) {
    console.error('Errore nel reset della password:', error);
    res.status(500).json({ message: 'Errore durante il reset della password.' });
  }
};

// Ottieni informazioni utente corrente
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Errore nel recupero dell\'utente corrente:', error);
    res.status(500).json({ message: 'Errore durante il recupero dell\'utente corrente.' });
  }
};
