-- Script per aggiungere codici di registrazione
-- Eseguire con: mysql -u donaction_u -p donaction < add_registration_codes.sql

-- Verifica che la tabella esista
USE donaction;

-- Disabilitiamo temporaneamente la modalità safe update
SET SQL_SAFE_UPDATES = 0;

-- Elimina i codici di registrazione di esempio esistenti
DELETE FROM registration_codes WHERE code IN ('ADMIN123', 'TEAM456');

-- Aggiungi 5 codici admin
INSERT INTO registration_codes (code, role, is_used) VALUES
('ADMIN_001', 'admin', FALSE),
('ADMIN_002', 'admin', FALSE),
('ADMIN_003', 'admin', FALSE),
('ADMIN_004', 'admin', FALSE),
('ADMIN_005', 'admin', FALSE);

-- Aggiungi 5 codici team
INSERT INTO registration_codes (code, role, is_used) VALUES
('TEAM_001', 'team', FALSE),
('TEAM_002', 'team', FALSE),
('TEAM_003', 'team', FALSE),
('TEAM_004', 'team', FALSE),
('TEAM_005', 'team', FALSE);

-- Mostra i codici inseriti
SELECT id, code, role, is_used, created_at FROM registration_codes;

-- Riabilitiamo la modalità safe update
SET SQL_SAFE_UPDATES = 1;
