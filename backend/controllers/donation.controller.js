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
    
    // Se l'utente è autenticato, associa la donazione all'utente
    const user_id = req.user ? req.user.id : null;
    
    const newDonation = await Donation.create({
      campaign_id,
      user_id,
      donor_name: user_id ? null : donor_name, // Se c'è un utente, prendiamo il suo nome dal profilo
      amount,
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
    });
  } catch (error) {
    console.error('Errore nella donazione:', error);
    res.status(500).json({ message: 'Errore durante l\'elaborazione della donazione.' });
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
    const donations = await Donation.getByUserId(req.user.id);
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
