// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Applica il middleware di autenticazione a tutte le routes
router.use(authMiddleware.authenticateToken);

// Statistiche dashboard
router.get('/stats/dashboard', adminController.getDashboardStats);

// Gestione utenti
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Gestione donazioni
router.get('/donations', adminController.getAllDonations);

// Gestione campagne
router.get('/campaigns', adminController.getAllCampaigns);
router.get('/campaigns/:id', adminController.getCampaignDetails);
router.post('/campaigns', adminController.createCampaign);
router.put('/campaigns/:id', adminController.updateCampaign);
router.delete('/campaigns/:id', adminController.deleteCampaign);

module.exports = router;
