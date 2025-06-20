// models/campaign.model.js
const pool = require('../config/db');

class Campaign {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as creator_name 
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `);
    return rows;
  }
  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as creator_name, 
             c.created_by as created_by
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]);
    
    const campaign = rows[0];
    if (campaign) {
      // Assicuriamo che created_by sia un numero per consistenza
      campaign.created_by = campaign.created_by ? Number(campaign.created_by) : null;
    }
    return campaign;
  }

  static async create(campaignData) {
    const { title, description, goal, imageUrl, category, created_by } = campaignData;
    const [result] = await pool.query(
      'INSERT INTO campaigns (title, description, goal, imageUrl, category, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, goal, imageUrl, category, created_by]
    );
    return { id: result.insertId, ...campaignData, collected: 0 };
  }
  static async update(id, campaignData) {
    try {
      const { title, description, goal, imageUrl, category } = campaignData;
      console.log(`Aggiornamento campagna ${id} con dati:`, campaignData);
      
      const [result] = await pool.query(
        'UPDATE campaigns SET title = ?, description = ?, goal = ?, imageUrl = ?, category = ? WHERE id = ?',
        [title, description, goal, imageUrl, category, id]
      );
      
      console.log(`Risultato aggiornamento:`, result);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Errore nell'aggiornamento della campagna ${id}:`, error);
      throw error;
    }
  }
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Prima eliminiamo tutte le donazioni associate alla campagna
      console.log(`Eliminazione donazioni per la campagna ${id}...`);
      await connection.query('DELETE FROM donations WHERE campaign_id = ?', [id]);
      
      // Poi eliminiamo la campagna
      console.log(`Eliminazione campagna ${id}...`);
      const [result] = await connection.query('DELETE FROM campaigns WHERE id = ?', [id]);
      
      await connection.commit();
      console.log(`Eliminazione completata con successo per la campagna ${id}`);
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error(`Errore nell'eliminazione della campagna ${id}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateCollectedAmount(id, amount) {
    const [result] = await pool.query(
      'UPDATE campaigns SET collected = collected + ? WHERE id = ?',
      [amount, id]
    );
    return result.affectedRows > 0;
  }

  static async getByCreatedBy(userId) {
    const [rows] = await pool.query('SELECT * FROM campaigns WHERE created_by = ?', [userId]);
    return rows;
  }
}

module.exports = Campaign;
