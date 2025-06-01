// controllers/campaign.controller.js
const Campaign = require('../models/campaign.model');

// All’avvio, assicurati che la tabella esista
Campaign.createTableIfNotExists();

exports.getAllCampaigns = (req, res) => {
  Campaign.getAll((err, results) => {
    if (err) return res.status(500).json({ message: err });
    res.json(results);
  });
};

exports.getCampaignById = (req, res) => {
  const id = req.params.id;
  Campaign.getById(id, (err, results) => {
    if (err) return res.status(500).json({ message: err });
    if (results.length === 0) return res.status(404).json({ message: 'Campagna non trovata' });
    res.json(results[0]);
  });
};

exports.createCampaign = (req, res) => {
  const data = req.body;
  if (!data.title || !data.goal) {
    return res.status(400).json({ message: 'Titolo e obiettivo sono obbligatori' });
  }
  Campaign.create(data, (err, result) => {
    if (err) return res.status(500).json({ message: err });
    res.status(201).json({ id: result.insertId, ...data });
  });
};

exports.updateCampaign = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Campaign.update(id, data, (err) => {
    if (err) return res.status(500).json({ message: err });
    res.json({ message: 'Campagna aggiornata' });
  });
};

exports.deleteCampaign = (req, res) => {
  const id = req.params.id;
  Campaign.delete(id, (err) => {
    if (err) return res.status(500).json({ message: err });
    res.json({ message: 'Campagna eliminata' });
  });
};
