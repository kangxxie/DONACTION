const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Registrazione utente
router.post('/register', authController.register);

// Login utente
router.post('/login', authController.login);

// Login admin
router.post('/admin/login', authController.adminLogin);

// Richiesta reset password
router.post('/forgot-password', authController.forgotPassword);

// Verifica token reset password
router.get('/reset-password/verify/:token', authController.verifyResetToken);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Ottieni utente corrente (protetto)
router.get('/me', authMiddleware.authenticateToken, authController.getCurrentUser);

module.exports = router;
