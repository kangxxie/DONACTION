// controllers/admin.controller.js
const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const pool = require('../config/db');

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

// Ottieni statistiche dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin o team member
    if (req.user.role !== 'admin' && req.user.role !== 'team') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }

    // 1. Ottieni il numero totale di utenti
    const [usersResult] = await pool.query(`
      SELECT COUNT(*) as totalUsers FROM users
    `);
    const totalUsers = usersResult[0].totalUsers;

    // 2. Ottieni il numero di campagne attive
    const [campaignsResult] = await pool.query(`
      SELECT COUNT(*) as totalCampaigns FROM campaigns
    `);
    const totalCampaigns = campaignsResult[0].totalCampaigns;

    // 3. Ottieni il numero totale di donazioni
    const [donationsResult] = await pool.query(`
      SELECT COUNT(*) as totalDonations FROM donations
    `);
    const totalDonations = donationsResult[0].totalDonations;

    // 4. Ottieni l'importo totale raccolto
    const [amountResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as totalAmount FROM donations WHERE payment_status = 'completed'
    `);
    // Assicuriamoci che totalAmount sia un numero
    const totalAmount = parseFloat(amountResult[0].totalAmount);

    // 5. Ottieni le donazioni più recenti
    const [recentDonations] = await pool.query(`
      SELECT d.id, d.amount, d.donated_at, d.payment_status,
             c.title as campaign_title,
             COALESCE(u.name, d.donor_name) as donor_name
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.donated_at DESC
      LIMIT 5
    `);

    // 6. Ottieni le campagne attive
    const [activeCampaigns] = await pool.query(`
      SELECT id, title, goal, collected, category, imageUrl
      FROM campaigns
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalAmount,
      recentDonations,
      activeCampaigns
    });
  } catch (error) {
    console.error('Errore nel recupero delle statistiche dashboard:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle statistiche dashboard' });
  }
};
