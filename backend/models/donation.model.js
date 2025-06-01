//definisce la tabella Donazioni

// models/donation.model.js
const db = require('../config/db');

const Donation = {};

// Crea tabella donations se non esiste
Donation.createTableIfNotExists = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      campaign_id INT NOT NULL,
      donor_name VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  db.query(sql, (err) => {
    if (err) console.error('Errore creazione tabella donations:', err);
    else console.log('Tabella donations pronta');
  });
};

// Restituisce tutte le donazioni di 1 campagna
Donation.getByCampaignId = (campaignId, callback) => {
  db.query(
    'SELECT * FROM donations WHERE campaign_id = ? ORDER BY donated_at DESC',
    [campaignId],
    callback
  );
};

// Crea donazione e aggiorna il totale raccolto
Donation.create = (data, callback) => {
  const { campaign_id, donor_name, amount } = data;
  // 1) Inserisci donazione
  db.query(
    'INSERT INTO donations (campaign_id, donor_name, amount) VALUES (?, ?, ?)',
    [campaign_id, donor_name, amount],
    (err, result) => {
      if (err) return callback(err);
      // 2) Aggiorna il campo collected in campaigns
      db.query(
        'UPDATE campaigns SET collected = collected + ? WHERE id = ?',
        [amount, campaign_id],
        (err2) => {
          if (err2) return callback(err2);
          callback(null, { id: result.insertId, ...data });
        }
      );
    }
  );
};

module.exports = Donation;
