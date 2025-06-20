// controllers/donation.controller.js
const Donation = require('../models/donation.model');
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

// Effettua una donazione
exports.makeDonation = async (req, res) => {
  try {
    const { campaign_id, amount, donor_name, email, payment_method } = req.body;
    
    // Verifica che il metodo di pagamento sia valido (solo card è supportato nel frontend)
    if (payment_method !== 'card') {
      return res.status(400).json({ 
        message: 'Metodo di pagamento non valido. Solo pagamenti con carta sono supportati.' 
      });
    }
    
    // Se l'utente è autenticato, associa la donazione all'utente
    const user_id = req.user ? req.user.id : null;
    
    // Validazione e conversione del campo amount per sicurezza
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: 'Importo donazione non valido. Deve essere maggiore di zero.'
      });
    }

    // Crea la donazione - il metodo create in Donation.model.js dovrebbe
    // occuparsi anche di aggiornare l'importo raccolto nella campagna
    const newDonation = await Donation.create({
      campaign_id,
      user_id,
      donor_name: user_id ? null : donor_name, // Se c'è un utente, prendiamo il suo nome dal profilo
      amount: numericAmount, // Usiamo il valore convertito
      email: email || (req.user ? req.user.email : null),
      payment_method
    });
    
    // Invia email di conferma se abbiamo un'email
    const donorEmail = email || (req.user ? req.user.email : null);
    if (donorEmail) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: donorEmail,
        subject: 'Grazie per la tua donazione - DONACTION',
        html: `
          <h1>Grazie per la tua donazione!</h1>
          <p>Abbiamo ricevuto la tua donazione di €${amount} per la campagna.</p>
          <p>Grazie per il tuo supporto e la tua generosità.</p>
          <p>Il team DONACTION</p>
        `
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Errore nell\'invio dell\'email di conferma:', error);
        }
      });
    }
    
    res.status(201).json({
      message: 'Donazione effettuata con successo.',
      donation: newDonation
    });    } catch (error) {
      console.error('Errore nella donazione:', error);
      
      // Gestione più dettagliata degli errori
      if (error.code === 'ER_NO_REFERENCED_ROW') {
        return res.status(400).json({ 
          message: 'La campagna specificata non esiste.',
          error: error.message 
        });
      } else if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          message: 'Questa donazione risulta già registrata.',
          error: error.message 
        });
      } else if (error.message && error.message.includes('campaign')) {
        return res.status(400).json({ 
          message: error.message,
          error: 'campaign_error' 
        });
      }
      
      res.status(500).json({ 
        message: 'Errore durante l\'elaborazione della donazione.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
};

// Ottieni le donazioni per una campagna
exports.getDonationsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const donations = await Donation.getByCampaignId(campaignId);
    res.json(donations);
  } catch (error) {
    console.error('Errore nel recupero delle donazioni:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle donazioni.' });
  }
};

// Ottieni le donazioni effettuate dall'utente corrente
exports.getUserDonations = async (req, res) => {
  try {
    // Log dettagliato per debug
    console.log('Richiesta donazioni utente - Headers:', JSON.stringify(req.headers));
    console.log('Richiesta donazioni utente - User object:', req.user ? JSON.stringify({ id: req.user.id, role: req.user.role }) : 'Nessun utente');
    
    if (!req.user || !req.user.id) {
      console.log('Errore: Utente non autenticato nella richiesta donazioni');
      return res.status(401).json({ message: 'Utente non autenticato' });
    }
    
    // Altro log per confermare l'ID utente
    console.log(`Cercando donazioni per utente ID: ${req.user.id}`);
    
    // Verifichiamo che l'utente esista nel database
    const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [req.user.id]);
    if (!userExists || userExists.length === 0) {
      console.log(`Errore: L'utente con ID ${req.user.id} non esiste nel database`);
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Richiedi le donazioni direttamente dalla query, bypassando il metodo getByUserId
    // in caso di problemi con la cache o altro
    const [donations] = await pool.query(`
      SELECT d.*, 
             c.title as campaign_title,
             c.collected as campaign_collected,
             c.imageUrl as campaign_image,
             c.category as campaign_category
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ?
      ORDER BY d.donated_at DESC
    `, [req.user.id]);
    
    // Log per debug
    console.log(`Recuperate ${donations.length} donazioni per l'utente ID ${req.user.id}`);
    if (donations.length > 0) {
      console.log('Dettaglio donazioni:', JSON.stringify(donations.map(d => ({ 
        id: d.id, 
        amount: d.amount, 
        campaign: d.campaign_title,
        date: d.donated_at
      }))));
    }
    
    res.json(donations);
  } catch (error) {
    console.error('Errore nel recupero delle donazioni dell\'utente:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle donazioni dell\'utente.' });
  }
};

// Ottieni tutte le donazioni (solo per admin)
exports.getAllDonations = async (req, res) => {
  try {
    // Verifica che l'utente sia un admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso non autorizzato.' });
    }
    
    const donations = await Donation.getAll();
    res.json(donations);
  } catch (error) {
    console.error('Errore nel recupero di tutte le donazioni:', error);
    res.status(500).json({ message: 'Errore durante il recupero di tutte le donazioni.' });
  }
};
