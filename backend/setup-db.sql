-- Script per configurare correttamente il database e l'utente
-- Da eseguire come utente root MySQL

-- Crea l'utente se non esiste
CREATE USER IF NOT EXISTS 'donaction_u'@'localhost' IDENTIFIED BY 'donation';

-- Rimuovi eventuali permessi esistenti
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'donaction_u'@'localhost';

-- Crea il database se non esiste
CREATE DATABASE IF NOT EXISTS donaction;

-- Assegna tutti i privilegi sul database donaction all'utente donaction_u
GRANT ALL PRIVILEGES ON donaction.* TO 'donaction_u'@'localhost';

-- Applica i permessi
FLUSH PRIVILEGES;

-- Usa il database donaction
USE donaction;

-- Tabella utenti
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('registered', 'team', 'admin') NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella campagne
CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  goal DECIMAL(10, 2) NOT NULL,
  collected DECIMAL(10, 2) DEFAULT 0.00,
  imageUrl VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabella donazioni
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  user_id INT,
  donor_name VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  email VARCHAR(100),
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabella token reset password
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella per i codici di registrazione admin e team
CREATE TABLE IF NOT EXISTS registration_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('team', 'admin') NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserimento di alcuni codici di esempio
INSERT INTO registration_codes (code, role) VALUES
('ADMIN123', 'admin'),
('TEAM456', 'team');

-- Inserimento di un utente admin di default (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@donaction.it', '$2b$10$3TAyO.rWv9OQ5O12BjUQ6e9nvsM3HX5jTrdJUx/YpLmR9hk0XcY.S', 'admin');

-- Mostra le tabelle per verificare che tutto sia stato creato correttamente
SHOW TABLES;
