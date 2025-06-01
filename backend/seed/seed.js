// seed/seed.js
const db = require('../config/db');

// Crea alcune campagne di esempio
const campaigns = [
  { title: 'Aiuto emergenza medica', description: 'Raccolta fondi per cure urgenti', goal: 5000 },
  { title: 'Protezione foreste', description: 'Salviamo gli alberi', goal: 10000 }
];

// Funzione per inserire campagne
function seedCampaigns() {
  campaigns.forEach(c => {
    db.query(
      'INSERT INTO campaigns (title, description, goal) VALUES (?, ?, ?)',
      [c.title, c.description, c.goal],
      (err) => {
        if (err) console.error('Errore seed campaign:', err);
      }
    );
  });
}

// Prima di tutto, assicurati che esistano le tabelle
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');

Campaign.createTableIfNotExists();
Donation.createTableIfNotExists();

// Dopodiché popola i dati con un timeout leggero
setTimeout(() => {
  seedCampaigns();
  console.log('Popolato DB con campagne di esempio');
  process.exit();
}, 1000);
