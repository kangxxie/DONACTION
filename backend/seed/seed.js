const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Creazione utenti
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Admin
    await connection.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin User', 'admin@donaction.com', ?, 'admin')
    `, [hashedPassword]);
    
    // Utente team
    await connection.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Team Member', 'team@donaction.com', ?, 'team')
    `, [hashedPassword]);
    
    // Utente registrato
    await connection.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Regular User', 'user@donaction.com', ?, 'registered')
    `, [hashedPassword]);
    
    // Creazione campagne
    await connection.query(`
      INSERT INTO campaigns (title, description, goal, collected, imageUrl, category, created_by)
      VALUES 
        ('Emergenza Terremoto', 'Aiuta le vittime del terremoto in Centro Italia', 50000, 12500, '/assets/earthquake.png', 'Emergenza', 1),
        ('Nuova Scuola in Africa', 'Costruiamo una scuola per i bambini in un villaggio rurale', 35000, 28000, '/assets/education.png', 'Istruzione', 2),
        ('Cure Mediche per Bambini', 'Supporta l\'accesso alle cure mediche per bambini in difficoltà', 25000, 15000, '/assets/heart-beat.svg', 'Salute', 2),
        ('Nuovo Reparto Ospedaliero', 'Contribuisci alla creazione di un nuovo reparto di pediatria', 100000, 42000, '/assets/hospital.png', 'Salute', 1)
    `);
    
    // Creazione donazioni
    await connection.query(`
      INSERT INTO donations (campaign_id, user_id, donor_name, amount, email, payment_method, payment_status)
      VALUES 
        (1, 3, NULL, 100, 'user@donaction.com', 'card', 'completed'),
        (1, NULL, 'Mario Rossi', 250, 'mario.rossi@example.com', 'paypal', 'completed'),
        (2, 3, NULL, 150, 'user@donaction.com', 'card', 'completed'),
        (3, NULL, 'Giulia Bianchi', 75, 'giulia.bianchi@example.com', 'card', 'completed'),
        (4, NULL, 'Luigi Verdi', 500, 'luigi.verdi@example.com', 'bank', 'completed')
    `);
    
    await connection.commit();
    console.log('Seed completato con successo!');
    
  } catch (error) {
    await connection.rollback();
    console.error('Errore durante il seeding:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
