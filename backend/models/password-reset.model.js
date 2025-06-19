// models/password-reset.model.js
const pool = require('../config/db');
const crypto = require('crypto');

class PasswordReset {
  static async createToken(userId) {
    // Genera un token casuale
    const token = crypto.randomBytes(32).toString('hex');
    
    // Scadenza: 1 ora da adesso
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Elimina eventuali token precedenti per questo utente
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
    
    // Crea un nuovo token
    const [result] = await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    
    return token;
  }
  
  static async findByToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }
  
  static async deleteToken(token) {
    await pool.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
  }
}

module.exports = PasswordReset;
