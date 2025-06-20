// test-db-donations.js
require('dotenv').config();
const pool = require('./config/db');

async function testDatabaseConnection() {
  try {
    console.log('Test connessione al database...');
    
    // Verifica la connessione
    const connection = await pool.getConnection();
    console.log('Connessione al database stabilita con successo!');
    
    // Test tabella donazioni
    console.log('\nTest tabella donazioni...');
    const [donations] = await connection.query('SELECT * FROM donations LIMIT 5');
    console.log(`Trovate ${donations.length} donazioni nel database.`);
    
    if (donations.length > 0) {
      console.log('Esempio donazione:');
      console.log(donations[0]);
    }
    
    // Test JOIN tra donazioni e campagne
    console.log('\nTest JOIN tra donazioni e campagne...');
    const [joinResults] = await connection.query(`
      SELECT d.id, d.amount, d.user_id, c.title as campaign_title
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      LIMIT 5
    `);
    
    console.log(`JOIN completato, trovati ${joinResults.length} risultati.`);
    
    if (joinResults.length > 0) {
      console.log('Esempio JOIN donazione-campagna:');
      console.log(joinResults[0]);
    }
    
    // Test per verificare le donazioni di un utente specifico
    console.log('\nTest per cercare utenti con donazioni...');
    const [userDonations] = await connection.query(`
      SELECT user_id, COUNT(*) as total_donations
      FROM donations
      WHERE user_id IS NOT NULL
      GROUP BY user_id
      LIMIT 5
    `);
    
    if (userDonations.length > 0) {
      console.log(`Trovati ${userDonations.length} utenti con donazioni:`);
      userDonations.forEach(ud => {
        console.log(`Utente ID ${ud.user_id}: ${ud.total_donations} donazioni`);
      });
      
      // Seleziona il primo utente con donazioni per testare
      const testUserId = userDonations[0].user_id;
      console.log(`\nTest dettaglio donazioni per utente ID ${testUserId}...`);
      
      const [donationDetails] = await connection.query(`
        SELECT d.*, c.title as campaign_title
        FROM donations d
        JOIN campaigns c ON d.campaign_id = c.id
        WHERE d.user_id = ?
        ORDER BY d.donated_at DESC
      `, [testUserId]);
      
      console.log(`Trovate ${donationDetails.length} donazioni per l'utente ID ${testUserId}:`);
      donationDetails.forEach((donation, index) => {
        console.log(`${index+1}. Donazione ID ${donation.id}: ${donation.amount}€ a "${donation.campaign_title}" (${donation.donated_at})`);
      });
    } else {
      console.log('Non sono stati trovati utenti con donazioni nel database.');
    }
    
    // Verifica donazioni recenti
    console.log('\nVerifica donazioni inserite nelle ultime 24 ore...');
    const [recentDonations] = await connection.query(`
      SELECT d.*, c.title as campaign_title, u.name as user_name
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.donated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY d.donated_at DESC
    `);
    
    if (recentDonations.length > 0) {
      console.log(`Trovate ${recentDonations.length} donazioni nelle ultime 24 ore:`);
      recentDonations.forEach((donation, index) => {
        const donorName = donation.user_name || donation.donor_name || 'Anonimo';
        console.log(`${index+1}. ${donorName} ha donato ${donation.amount}€ a "${donation.campaign_title}" (${donation.donated_at})`);
      });
    } else {
      console.log('Nessuna donazione recente trovata nelle ultime 24 ore.');
    }
    
    // Rilascia la connessione
    connection.release();
    
    // Chiudi il pool
    await pool.end();
    console.log('\nTest database completato con successo.');
  } catch (error) {
    console.error('Errore durante il test del database:', error);
    try {
      await pool.end();
    } catch (e) {
      console.error('Errore nella chiusura del pool:', e);
    }
  }
}

// Esegui il test
testDatabaseConnection();
