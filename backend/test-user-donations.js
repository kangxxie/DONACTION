// test-user-donations.js
const Donation = require('./models/donation.model');
const pool = require('./config/db');
require('dotenv').config();

// Funzione di test per verificare le donazioni di un utente
async function testUserDonations(userId) {
  try {
    console.log(`--- Test donazioni per utente ID: ${userId} ---`);
    
    // Verifica connessione al database
    console.log('Verifica connessione al database...');
    await pool.query('SELECT 1');
    console.log('✅ Connessione al database OK');
    
    // Verifica presenza dell'utente
    console.log(`Verifica utente ID: ${userId}...`);
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      console.log(`❌ Utente ID ${userId} non trovato nel database`);
      return;
    }
    console.log(`✅ Utente trovato: ${userRows[0].name} (${userRows[0].email})`);
    
    // Recupera donazioni con SQL diretto
    console.log('Recupero donazioni con SQL diretto...');
    const [rawDonations] = await pool.query(`
      SELECT d.*, c.title as campaign_title
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ?
      ORDER BY d.donated_at DESC
    `, [userId]);
    
    console.log(`✅ Trovate ${rawDonations.length} donazioni con SQL diretto:`);
    if (rawDonations.length > 0) {
      rawDonations.forEach(d => {
        console.log(`- ID: ${d.id}, Campagna: ${d.campaign_title}, Importo: €${d.amount}, Data: ${d.donated_at}`);
      });
    } else {
      console.log('   Nessuna donazione trovata con SQL diretto');
    }
    
    // Recupera donazioni con il metodo del model
    console.log('\nRecupero donazioni con il metodo Donation.getByUserId...');
    const modelDonations = await Donation.getByUserId(userId);
    
    console.log(`✅ Trovate ${modelDonations.length} donazioni con il model:`);
    if (modelDonations.length > 0) {
      modelDonations.forEach(d => {
        console.log(`- ID: ${d.id}, Campagna: ${d.campaign_title}, Importo: €${d.amount}, Data: ${d.donated_at}`);
      });
    } else {
      console.log('   Nessuna donazione trovata con il model');
    }
    
    // Verifica JWT
    console.log('\nVerifica configurazione JWT...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET non configurato nel file .env');
    } else {
      console.log('✅ JWT_SECRET configurato correttamente');
    }
    
    console.log('\n--- Test completato ---');
  } catch (error) {
    console.error('Errore durante il test:', error);
  } finally {
    // Chiudi il pool di connessione
    await pool.end();
  }
}

// Recupera l'ID utente dal comando (o usa un ID di default per test)
const userId = process.argv[2] || 1;
testUserDonations(userId);
