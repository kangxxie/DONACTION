// controllers/donation.controller.js
const Donation = require('../models/donation.model');

// All’avvio, crea la tabella se non esiste
Donation.createTableIfNotExists();

exports.getDonationsByCampaign = (req, res) => {
  const campaignId = req.params.campaignId;
  Donation.getByCampaignId(campaignId, (err, results) => {
    if (err) return res.status(500).json({ message: err });
    res.json(results);
  });
};

exports.createDonation = (req, res) => {
  const data = req.body;
  if (!data.campaign_id || !data.amount) {
    return res.status(400).json({ message: 'campaign_id e amount sono obbligatori' });
  }
  Donation.create(data, (err, result) => {
    if (err) return res.status(500).json({ message: err });
    res.status(201).json(result);
  });
};
