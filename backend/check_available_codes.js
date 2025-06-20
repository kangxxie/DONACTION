// check_available_codes.js
// Script per verificare i codici di registrazione disponibili
const pool = require('./config/db');

async function checkAvailableCodes() {
  try {
    // Connessione al database
    const connection = await pool.getConnection();
    console.log('✅ Connessione al database riuscita!');
    
    // Verifica i codici disponibili
    const [codes] = await connection.query(`
      SELECT id, code, role, is_used, created_at 
      FROM registration_codes 
      ORDER BY role, is_used, code
    `);
    
    console.log('\n📋 CODICI DI REGISTRAZIONE:');
    console.log('=================================');
    
    // Raggruppa i codici per ruolo e stato
    const adminCodes = codes.filter(c => c.role === 'admin');
    const teamCodes = codes.filter(c => c.role === 'team');
    
    const availableAdminCodes = adminCodes.filter(c => !c.is_used);
    const usedAdminCodes = adminCodes.filter(c => c.is_used);
    
    const availableTeamCodes = teamCodes.filter(c => !c.is_used);
    const usedTeamCodes = teamCodes.filter(c => c.is_used);
    
    // Mostra codici admin disponibili
    console.log('🔑 CODICI ADMIN DISPONIBILI:');
    if (availableAdminCodes.length > 0) {
      availableAdminCodes.forEach(code => {
        console.log(`   - ${code.code} (ID: ${code.id})`);
      });
    } else {
      console.log('   Nessun codice admin disponibile');
    }
    
    // Mostra codici team disponibili
    console.log('\n🔑 CODICI TEAM DISPONIBILI:');
    if (availableTeamCodes.length > 0) {
      availableTeamCodes.forEach(code => {
        console.log(`   - ${code.code} (ID: ${code.id})`);
      });
    } else {
      console.log('   Nessun codice team disponibile');
    }
    
    // Statistiche
    console.log('\n📊 STATISTICHE:');
    console.log(`   - Codici admin totali: ${adminCodes.length} (${availableAdminCodes.length} disponibili, ${usedAdminCodes.length} utilizzati)`);
    console.log(`   - Codici team totali: ${teamCodes.length} (${availableTeamCodes.length} disponibili, ${usedTeamCodes.length} utilizzati)`);
    
    // Rilascia la connessione
    connection.release();
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    // Chiudi il pool
    pool.end();
  }
}

// Esegui la funzione
checkAvailableCodes();
