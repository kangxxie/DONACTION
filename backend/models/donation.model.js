// models/donation.model.js
const pool = require('../config/db');

class Donation {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT d.*, c.title as campaign_title, 
      COALESCE(u.name, d.donor_name) as donor_name
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.donated_at DESC
    `);
    return rows;
  }

  static async getByCampaignId(campaignId) {
    const [rows] = await pool.query(`
      SELECT d.*, COALESCE(u.name, d.donor_name) as donor_name
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = ?
      ORDER BY d.donated_at DESC
    `, [campaignId]);
    return rows;
  }
  static async getByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT d.*, 
             c.title as campaign_title,
             c.collected as campaign_collected,
             c.imageUrl as campaign_image,
             c.category as campaign_category
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ?
      ORDER BY d.donated_at DESC
    `, [userId]);
    
    // Log per debug
    console.log(`Query donazioni per userId ${userId}: trovate ${rows.length} donazioni`);
    
    return rows;
  }  static async create(donationData) {
    const { campaign_id, user_id, donor_name, amount, email, payment_method } = donationData;
    
    // Validazione dei dati essenziali
    if (!campaign_id || !amount || amount <= 0) {
      throw new Error('Dati donazione non validi. Verificare campaign_id e amount.');
    }
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Log per debug
      console.log(`Creazione donazione: ${amount}€ per campagna ${campaign_id}` + 
                 (user_id ? ` da utente ${user_id}` : ` da donatore anonimo (${donor_name || 'senza nome'})`));
      
      // Create donation
      const [result] = await connection.query(
        'INSERT INTO donations (campaign_id, user_id, donor_name, amount, email, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [campaign_id, user_id, donor_name, amount, email, payment_method, 'completed']
      );
      
      console.log(`Donazione inserita con ID ${result.insertId}`);
      
      // Update campaign collected amount
      const [updateResult] = await connection.query(
        'UPDATE campaigns SET collected = collected + ? WHERE id = ?',
        [amount, campaign_id]
      );
      
      // Verifica se l'aggiornamento è andato a buon fine
      if (updateResult.affectedRows === 0) {
        // Rollback se la campagna non esiste
        console.error(`Errore: Campagna con ID ${campaign_id} non trovata`);
        await connection.rollback();
        throw new Error(`Campagna con ID ${campaign_id} non trovata.`);
      }
      
      console.log(`Campagna ${campaign_id} aggiornata: collected += ${amount}`);
      
      // Leggi i dati aggiornati della campagna
      const [campaignRows] = await connection.query(
        'SELECT collected, title FROM campaigns WHERE id = ?',
        [campaign_id]
      );
      
      if (!campaignRows || campaignRows.length === 0) {
        console.error(`Errore: Impossibile leggere i dati aggiornati della campagna ${campaign_id}`);
        await connection.rollback();
        throw new Error(`Impossibile leggere i dati aggiornati della campagna ${campaign_id}`);
      }
      
      const newCollectedAmount = campaignRows[0].collected;
      console.log(`Nuovo importo raccolto per campagna ${campaign_id} (${campaignRows[0].title}): ${newCollectedAmount}`);
      
      await connection.commit();
      console.log('Transazione completata con successo');
      
      // Restituiamo la donazione con i dati aggiornati della campagna
      return { 
        id: result.insertId, 
        ...donationData,
        campaign_collected: newCollectedAmount,
        campaign_title: campaignRows[0].title,
        donated_at: new Date()
      };
    } catch (error) {
      console.error('Errore durante la creazione della donazione:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT d.*, c.title as campaign_title, 
      COALESCE(u.name, d.donor_name) as donor_name
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `, [id]);
    return rows[0];
  }
}

module.exports = Donation;
