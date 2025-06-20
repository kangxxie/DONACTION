// controllers/user.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Ottieni profilo utente
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica che l'utente richieda il proprio profilo
    if (req.user.id != userId) {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error);
    res.status(500).json({ message: 'Errore durante il recupero del profilo utente' });
  }
};

// Aggiorna profilo utente
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nome, email } = req.body;
    
    // Verifica che l'utente stia aggiornando il proprio profilo
    if (req.user.id != userId) {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    // Verifica se l'email è già in uso da un altro utente
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id != userId) {
      return res.status(400).json({ message: 'Email già in uso da un altro utente' });
    }
    
    // Aggiorna il profilo
    await User.update(userId, { 
      name: nome, 
      email: email,
      role: req.user.role // Mantiene il ruolo esistente
    });
    
    res.json({ message: 'Profilo aggiornato con successo' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del profilo:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo utente' });
  }
};

// Cambia password utente
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Verifica che l'utente stia cambiando la propria password
    if (req.user.id != userId) {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    // Recupera l'utente completo inclusa la password (hash)
    const [rows] = await User.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Verifica la password corrente
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password corrente non valida' });
    }
    
    // Aggiorna la password
    await User.updatePassword(userId, newPassword);
    
    res.json({ message: 'Password cambiata con successo' });
  } catch (error) {
    console.error('Errore nel cambio password:', error);
    res.status(500).json({ message: 'Errore durante il cambio password' });
  }
};

// Ottieni statistiche utente
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica che l'utente richieda le proprie statistiche
    if (req.user.id != userId) {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    // Esegui query per ottenere le statistiche
    const [donationStats] = await User.query(`
      SELECT 
        COUNT(*) as totalDonations,
        COALESCE(SUM(amount), 0) as donationAmount,
        COUNT(DISTINCT campaign_id) as campaignsSupported
      FROM donations 
      WHERE user_id = ?
    `, [userId]);
    
    res.json({
      totalDonations: donationStats.totalDonations || 0,
      donationAmount: donationStats.donationAmount || 0,
      campaignsSupported: donationStats.campaignsSupported || 0
    });
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle statistiche utente' });
  }
};
