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

// Elimina una campagna (solo per admin)
exports.deleteCampaign = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin o team
    if (req.user.role !== 'admin' && req.user.role !== 'team') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const campaignId = req.params.id;
    
    // Verifica che la campagna esista
    const [campaign] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (campaign.length === 0) {
      return res.status(404).json({ message: 'Campagna non trovata' });
    }
    
    // Se l'utente è un team member, può eliminare solo le campagne che ha creato
    const createdBy = Number(campaign[0].created_by);
    const userId = Number(req.user.id);
    
    console.log(`Tentativo di eliminazione campagna ${campaignId}:`);
    console.log(`- Utente: ${userId}, ruolo: ${req.user.role}`);
    console.log(`- Creatore campagna: ${createdBy}`);
    
    if (req.user.role === 'team' && createdBy !== userId) {
      console.log(`Accesso negato: l'utente team ${userId} sta cercando di eliminare una campagna creata da ${createdBy}`);
      return res.status(403).json({ message: 'Non hai i permessi per eliminare questa campagna' });
    }
    
    // Esegui l'eliminazione in una transazione
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Prima elimina le donazioni associate
      console.log(`Eliminazione donazioni per la campagna ${campaignId}...`);
      await connection.query('DELETE FROM donations WHERE campaign_id = ?', [campaignId]);
      
      // Poi elimina la campagna
      console.log(`Eliminazione campagna ${campaignId}...`);
      const [result] = await connection.query('DELETE FROM campaigns WHERE id = ?', [campaignId]);
      
      await connection.commit();
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Campagna non trovata o già eliminata' });
      }
      
      console.log(`Campagna ${campaignId} eliminata con successo da ${req.user.id} (${req.user.role})`);
      res.json({ message: 'Campagna eliminata con successo' });
    } catch (error) {
      await connection.rollback();
      console.error('Errore nell\'eliminazione della campagna:', error);
      res.status(500).json({ message: 'Errore durante l\'eliminazione della campagna' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Errore nell\'eliminazione della campagna:', error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione della campagna' });
  }
};

// Ottieni tutte le campagne (per admin o team)
exports.getAllCampaigns = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin o team
    if (req.user.role !== 'admin' && req.user.role !== 'team') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    let query = `
      SELECT c.*, u.name as creator_name 
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
    `;
    
    // Se l'utente è un team member, mostra solo le sue campagne
    if (req.user.role === 'team') {
      query += ` WHERE c.created_by = ${req.user.id}`;
    }
    
    query += ` ORDER BY c.created_at DESC`;
    
    const [campaigns] = await pool.query(query);
    res.json(campaigns);
  } catch (error) {
    console.error('Errore nel recupero delle campagne:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle campagne' });
  }
};

// Ottieni dettagli di una campagna specifica (per admin o team)
exports.getCampaignDetails = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin o team
    if (req.user.role !== 'admin' && req.user.role !== 'team') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const campaignId = req.params.id;
    
    const [campaigns] = await pool.query(`
      SELECT c.*, u.name as creator_name 
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [campaignId]);
    
    if (campaigns.length === 0) {
      return res.status(404).json({ message: 'Campagna non trovata' });
    }
    
    const campaign = campaigns[0];
    
    // Se l'utente è un team member, può vedere solo le sue campagne
    if (req.user.role === 'team' && Number(campaign.created_by) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Non hai i permessi per visualizzare questa campagna' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Errore nel recupero della campagna:', error);
    res.status(500).json({ message: 'Errore durante il recupero della campagna' });
  }
};

// Crea una nuova campagna (per admin o team)
exports.createCampaign = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin o team
    if (req.user.role !== 'admin' && req.user.role !== 'team') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const { title, description, goal, imageUrl, category } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO campaigns (title, description, goal, imageUrl, category, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, goal, imageUrl, category, req.user.id]
    );
    
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      goal,
      imageUrl,
      category,
      created_by: req.user.id,
      collected: 0
    });
  } catch (error) {
    console.error('Errore nella creazione della campagna:', error);
    res.status(500).json({ message: 'Errore durante la creazione della campagna' });
  }
};

// Aggiorna una campagna (per admin o team)
exports.updateCampaign = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin o team
    if (req.user.role !== 'admin' && req.user.role !== 'team') {
      return res.status(403).json({ message: 'Accesso non autorizzato' });
    }
    
    const campaignId = req.params.id;
    const { title, description, goal, imageUrl, category } = req.body;
    
    // Verifica che la campagna esista
    const [campaigns] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (campaigns.length === 0) {
      return res.status(404).json({ message: 'Campagna non trovata' });
    }
    
    const campaign = campaigns[0];
    
    // Se l'utente è un team member, può aggiornare solo le sue campagne
    if (req.user.role === 'team' && Number(campaign.created_by) !== Number(req.user.id)) {
      console.log(`Accesso negato: l'utente team ${req.user.id} sta cercando di modificare una campagna creata da ${campaign.created_by}`);
      return res.status(403).json({ message: 'Non hai i permessi per modificare questa campagna' });
    }
    
    const [result] = await pool.query(
      'UPDATE campaigns SET title = ?, description = ?, goal = ?, imageUrl = ?, category = ? WHERE id = ?',
      [title, description, goal, imageUrl, category, campaignId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campagna non trovata o nessuna modifica effettuata' });
    }
    
    res.json({ message: 'Campagna aggiornata con successo' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della campagna:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento della campagna' });
  }
};
