const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rotte pubbliche
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rotta admin separata
router.post('/admin/login', authController.adminLogin);

// Rotte protette che richiedono autenticazione
router.get('/me', authMiddleware.verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
