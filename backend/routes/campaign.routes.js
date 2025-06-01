// routes/campaign.routes.js
const express = require('express');
const router = express.Router();
const campaignCtrl = require('../controllers/campaign.controller');

// GET /api/campaigns
router.get('/', campaignCtrl.getAllCampaigns);

// GET /api/campaigns/:id
router.get('/:id', campaignCtrl.getCampaignById);

// POST /api/campaigns
router.post('/', campaignCtrl.createCampaign);

// PUT /api/campaigns/:id
router.put('/:id', campaignCtrl.updateCampaign);

// DELETE /api/campaigns/:id
router.delete('/:id', campaignCtrl.deleteCampaign);

module.exports = router;
