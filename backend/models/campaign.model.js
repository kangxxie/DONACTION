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
      SELECT c.*, u.name as creator_name 
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]);
    return rows[0];
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
    const { title, description, goal, imageUrl, category } = campaignData;
    const [result] = await pool.query(
      'UPDATE campaigns SET title = ?, description = ?, goal = ?, imageUrl = ?, category = ? WHERE id = ?',
      [title, description, goal, imageUrl, category, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM campaigns WHERE id = ?', [id]);
    return result.affectedRows > 0;
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

module.exports = Campaign;
