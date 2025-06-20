// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Applica il middleware di autenticazione a tutte le routes
router.use(authMiddleware.authenticateToken);

// Recupera profilo utente
router.get('/:id', userController.getUserProfile);

// Aggiorna profilo utente
router.put('/:id/profile', userController.updateProfile);

// Cambia password utente
router.put('/:id/password', userController.changePassword);

// Ottieni statistiche utente
router.get('/:id/stats', userController.getUserStats);

module.exports = router;
