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

// Richiesta reset password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verifica se l'utente esiste
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }
    
    // Genera token di reset
    const resetToken = await PasswordReset.createToken(user.id);
    
    // Invia email con token
    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset Password - DONACTION',
      html: `
        <h1>Reset della tua password</h1>
        <p>Hai richiesto il reset della password. Clicca sul link seguente per reimpostare la password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>Il link scadrà tra un'ora.</p>
        <p>Se non hai richiesto il reset della password, ignora questa email.</p>
      `
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Errore nell\'invio dell\'email:', error);
        return res.status(500).json({ message: 'Errore nell\'invio dell\'email di reset.' });
      }
      res.json({ message: 'Email per il reset della password inviata.' });
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

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const resetRecord = await PasswordReset.findByToken(token);
    if (!resetRecord) {
      return res.status(400).json({ message: 'Token di reset non valido o scaduto.' });
    }
    
    // Aggiorna la password dell'utente
    await User.updatePassword(resetRecord.user_id, newPassword);
    
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
