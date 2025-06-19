const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Accesso negato. Token non fornito.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ message: 'Utente non trovato.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token non valido o scaduto.' });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Accesso non autorizzato.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Non hai i permessi per accedere a questa risorsa.' });
    }
    
    next();
  };
};