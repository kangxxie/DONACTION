// models/user.model.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password, role = 'registered' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    return { id: result.insertId, name, email, role };
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, userData) {
    const { name, email, role } = userData;
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    return rows;
  }
}

module.exports = User;
