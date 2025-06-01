// routes/donation.routes.js
const express = require('express');
const router = express.Router();
const donationCtrl = require('../controllers/donation.controller');

// GET /api/donations/:campaignId
router.get('/:campaignId', donationCtrl.getDonationsByCampaign);

// POST /api/donations
router.post('/', donationCtrl.createDonation);

module.exports = router;
