// controllers/admin.controller.js
const User = require('../models/user.model');
const Donation = require('../models/donation.model');

// Ottieni tutti gli utenti (solo per admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    res.status(500).json({ message: 'Errore durante il recupero degli utenti' });
  }
};

// Ottieni dettagli di un utente specifico (solo per admin)
exports.getUserDetails = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Errore nel recupero dei dettagli utente:', error);
    res.status(500).json({ message: 'Errore durante il recupero dei dettagli utente' });
  }
};

// Aggiorna un utente (solo per admin)
exports.updateUser = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const userId = req.params.id;
    const { name, email, role } = req.body;
    
    // Verifica che l'utente esista
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Aggiorna l'utente
    await User.update(userId, { name, email, role });
    
    res.json({ message: 'Utente aggiornato con successo' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'utente:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento dell\'utente' });
  }
};

// Elimina un utente (solo per admin)
exports.deleteUser = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const userId = req.params.id;
    
    // Verifica che l'utente esista
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Elimina l'utente
    await User.delete(userId);
    
    res.json({ message: 'Utente eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'utente:', error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione dell\'utente' });
  }
};

// Ottieni tutte le donazioni (solo per admin)
exports.getAllDonations = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
      let donations = await Donation.getAll();
    
    // Assicuriamoci che gli importi siano numeri
    donations = donations.map(donation => ({
      ...donation,
      amount: parseFloat(donation.amount)
    }));
    
    res.json(donations);
  } catch (error) {
    console.error('Errore nel recupero delle donazioni:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle donazioni' });
  }
};
