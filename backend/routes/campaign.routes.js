const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ottieni tutte le campagne (pubblico)
router.get('/', campaignController.getAllCampaigns);

// Ottieni una campagna specifica (pubblico)
router.get('/:id', campaignController.getCampaignById);

// Crea una nuova campagna (solo team e admin)
router.post('/', 
  authMiddleware.authenticateToken, 
  authMiddleware.authorizeRoles('team', 'admin'), 
  campaignController.createCampaign
);

// Aggiorna una campagna (solo team e admin)
router.put('/:id', 
  authMiddleware.authenticateToken, 
  authMiddleware.authorizeRoles('team', 'admin'), 
  campaignController.updateCampaign
);

// Elimina una campagna (solo team e admin)
router.delete('/:id', 
  authMiddleware.authenticateToken, 
  authMiddleware.authorizeRoles('team', 'admin'), 
  campaignController.deleteCampaign
);

// Ottieni le campagne create dall'utente corrente (solo team e admin)
router.get('/user/my-campaigns', 
  authMiddleware.authenticateToken, 
  authMiddleware.authorizeRoles('team', 'admin'), 
  campaignController.getCampaignsByUser
);

module.exports = router;
