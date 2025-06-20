// test-user-donations-fixed.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('./config/db');

// Funzione per generare un token JWT valido per un utente specifico
function generateToken(userId, userRole) {
  return jwt.sign(
    { id: userId, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Funzione per testare l'endpoint donazioni utente
async function testUserDonationsEndpoint() {
  try {
    // Ottieni un utente esistente dal database
    const [users] = await pool.query('SELECT id, email, role FROM users LIMIT 1');
    
    if (!users || users.length === 0) {
      console.error('Nessun utente trovato nel database.');
      return;
    }
    
    const testUser = users[0];
    console.log('Utente di test:', testUser);
    
    // Genera un token JWT per l'utente
    const token = generateToken(testUser.id, testUser.role);
    console.log('Token JWT generato:', token);
    
    // Verifica se l'utente ha donazioni
    const [donations] = await pool.query('SELECT COUNT(*) as count FROM donations WHERE user_id = ?', [testUser.id]);
    console.log(`L'utente ha ${donations[0].count} donazioni nel database.`);
    
    // Se non ci sono donazioni, ne creiamo una di test
    if (donations[0].count === 0) {
      console.log('Creazione donazione di test...');
      const [campaigns] = await pool.query('SELECT id FROM campaigns LIMIT 1');
      
      if (!campaigns || campaigns.length === 0) {
        console.error('Nessuna campagna trovata nel database.');
        return;
      }
      
      // Inserisci una donazione di test
      await pool.query(
        'INSERT INTO donations (campaign_id, user_id, amount, payment_method, payment_status, donated_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [campaigns[0].id, testUser.id, 10, 'card', 'completed']
      );
      
      // Aggiorna l'importo raccolto nella campagna
      await pool.query(
        'UPDATE campaigns SET collected = collected + ? WHERE id = ?',
        [10, campaigns[0].id]
      );
      
      console.log('Donazione di test creata.');
    }
    
    // Fai la richiesta all'endpoint delle donazioni dell'utente
    console.log('Richiesta endpoint donazioni utente...');
    const response = await axios.get('http://localhost:8080/api/donations/user/my-donations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\nRisposta dell\'endpoint:');
    console.log('Status:', response.status);
    console.log('Donazioni trovate:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\nDettaglio prima donazione:');
      console.log(JSON.stringify(response.data[0], null, 2));
    }
    
    // Verifica diretta dal database
    const [dbDonations] = await pool.query(`
      SELECT d.*, c.title as campaign_title
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ?
    `, [testUser.id]);
    
    console.log('\nDonazioni nel database:', dbDonations.length);
    
    if (dbDonations.length !== response.data.length) {
      console.error('\nATTENZIONE: Il numero di donazioni nell\'API non corrisponde al database!');
      console.log('Database:', dbDonations.length, 'API:', response.data.length);
    }
    
    // Chiudi la connessione al database
    await pool.end();
    
    console.log('\nTest completato.');
  } catch (error) {
    console.error('Errore durante il test:', error);
    
    if (error.response) {
      console.error('Risposta del server:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
    
    // Chiudi la connessione al database in caso di errore
    try {
      await pool.end();
    } catch (dbError) {
      console.error('Errore nella chiusura della connessione al database:', dbError);
    }
  }
}

// Esegui il test
testUserDonationsEndpoint();
