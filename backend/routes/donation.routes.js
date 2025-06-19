const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Effettua una donazione (disponibile per tutti, ma l'autenticazione è opzionale)
router.post('/', 
  (req, res, next) => {
    // Middleware opzionale: se il token è presente, autentica l'utente, altrimenti prosegui
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      authMiddleware.authenticateToken(req, res, next);
    } else {
      next();
    }
  }, 
  donationController.makeDonation
);

// Ottieni le donazioni per una campagna (pubblico)
router.get('/:campaignId', donationController.getDonationsByCampaign);

// Ottieni le donazioni dell'utente corrente (autenticato)
router.get('/user/my-donations', 
  authMiddleware.authenticateToken, 
  donationController.getUserDonations
);

// Ottieni tutte le donazioni (solo admin)
router.get('/', 
  authMiddleware.authenticateToken, 
  authMiddleware.authorizeRoles('admin'), 
  donationController.getAllDonations
);

module.exports = router;
