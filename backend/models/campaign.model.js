//definisce la tabella Campagne// models/campaign.model.js
const db = require('../config/db');

const Campaign = {};

// Crea tabella se non esiste
Campaign.createTableIfNotExists = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      goal DECIMAL(10,2) NOT NULL,
      collected DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  db.query(sql, (err) => {
    if (err) console.error('Errore creazione tabella campaigns:', err);
    else console.log('Tabella campaigns pronta');
  });
};

// Restituisce tutte le campagne
Campaign.getAll = (callback) => {
  db.query('SELECT * FROM campaigns', callback);
};

// Restituisce 1 campagna per id
Campaign.getById = (id, callback) => {
  db.query('SELECT * FROM campaigns WHERE id = ?', [id], callback);
};

// Crea una nuova campagna
Campaign.create = (data, callback) => {
  const { title, description, goal } = data;
  db.query(
    'INSERT INTO campaigns (title, description, goal) VALUES (?, ?, ?)',
    [title, description, goal],
    callback
  );
};

// Aggiorna campagna (es. collected, descrizione, obiettivo)
Campaign.update = (id, data, callback) => {
  // per semplicità, aggiorna solo titolo/descrizione/goal
  const { title, description, goal } = data;
  db.query(
    'UPDATE campaigns SET title = ?, description = ?, goal = ? WHERE id = ?',
    [title, description, goal, id],
    callback
  );
};

// Elimina una campagna
Campaign.delete = (id, callback) => {
  db.query('DELETE FROM campaigns WHERE id = ?', [id], callback);
};

module.exports = Campaign;
