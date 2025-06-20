-- Script per sistemare i dati delle donazioni
-- Eseguire con: mysql -u donaction_u -p donaction < fix_donation_data.sql

USE donaction;

-- Disabilitiamo temporaneamente la modalità safe update
SET SQL_SAFE_UPDATES = 0;

-- Elimina tutte le donazioni degli utenti normali (non admin, non team)
DELETE d FROM donations d
INNER JOIN users u ON d.user_id = u.id
WHERE u.role = 'registered';

-- Aggiorna le donazioni fittizie solo per admin e team member esistenti
-- Prima identifichiamo gli utenti admin e team
CREATE TEMPORARY TABLE IF NOT EXISTS admin_team_users AS
SELECT id, name, email, role FROM users 
WHERE role IN ('admin', 'team');

-- Aggiungi alcune donazioni fittizie per admin e team member (se non ne hanno già)
INSERT INTO donations (campaign_id, user_id, donor_name, amount, email, payment_method, payment_status)
SELECT 
    c.id as campaign_id,
    u.id as user_id,
    u.name as donor_name,
    ROUND(RAND() * 100 + 10, 2) as amount,
    u.email,
    'card' as payment_method,
    'completed' as payment_status
FROM admin_team_users u
CROSS JOIN (SELECT id FROM campaigns LIMIT 3) c
LEFT JOIN (
    SELECT DISTINCT user_id FROM donations
) existing_donors ON u.id = existing_donors.user_id
WHERE existing_donors.user_id IS NULL
LIMIT 10;

-- Aggiorniamo gli importi raccolti nelle campagne per riflettere le donazioni
-- Utilizziamo l'id nella clausola WHERE per rispettare la modalità safe update
UPDATE campaigns c
SET c.collected = (
    SELECT COALESCE(SUM(d.amount), 0)
    FROM donations d
    WHERE d.campaign_id = c.id
)
WHERE c.id > 0;

-- Mostra i risultati
SELECT 'Utenti admin/team' AS info, COUNT(*) AS count FROM admin_team_users;
SELECT 'Donazioni totali' AS info, COUNT(*) AS count FROM donations;
SELECT 'Campagne' AS info, COUNT(*) AS count, SUM(collected) AS total_collected FROM campaigns;

-- Pulizia
DROP TEMPORARY TABLE IF EXISTS admin_team_users;

-- Riabilitiamo la modalità safe update
SET SQL_SAFE_UPDATES = 1;
