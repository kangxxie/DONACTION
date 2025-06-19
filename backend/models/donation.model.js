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
      SELECT d.*, c.title as campaign_title
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ?
      ORDER BY d.donated_at DESC
    `, [userId]);
    return rows;
  }

  static async create(donationData) {
    const { campaign_id, user_id, donor_name, amount, email, payment_method } = donationData;
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Create donation
      const [result] = await connection.query(
        'INSERT INTO donations (campaign_id, user_id, donor_name, amount, email, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [campaign_id, user_id, donor_name, amount, email, payment_method, 'completed']
      );
      
      // Update campaign collected amount
      await connection.query(
        'UPDATE campaigns SET collected = collected + ? WHERE id = ?',
        [amount, campaign_id]
      );
      
      await connection.commit();
      return { id: result.insertId, ...donationData };
    } catch (error) {
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

module.exports = Donation;
