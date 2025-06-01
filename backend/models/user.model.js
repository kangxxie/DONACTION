//utile per future registrazioni

// models/user.model.js
const db = require('../config/db');

const User = {};

// Tabella utenti (per future estensioni)
User.createTableIfNotExists = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('donor','promoter','admin') DEFAULT 'donor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  db.query(sql, (err) => {
    if (err) console.error('Errore creazione tabella users:', err);
    else console.log('Tabella users pronta');
  });
};

module.exports = User;
