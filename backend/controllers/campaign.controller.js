// controllers/campaign.controller.js
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');

// Ottieni tutte le campagne
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.getAll();
    res.json(campaigns);
  } catch (error) {
    console.error('Errore nel recupero delle campagne:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle campagne.' });
  }
};

// Ottieni una campagna specifica
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.getById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campagna non trovata.' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Errore nel recupero della campagna:', error);
    res.status(500).json({ message: 'Errore durante il recupero della campagna.' });
  }
};

// Crea una nuova campagna
exports.createCampaign = async (req, res) => {
  try {
    const { title, description, goal, imageUrl, category } = req.body;
    
    // Assicura che solo gli utenti 'team' o 'admin' possano creare campagne
    if (req.user.role !== 'team' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non hai i permessi per creare campagne.' });
    }
    
    const newCampaign = await Campaign.create({
      title,
      description,
      goal,
      imageUrl,
      category,
      created_by: req.user.id
    });
    
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Errore nella creazione della campagna:', error);
    res.status(500).json({ message: 'Errore durante la creazione della campagna.' });
  }
};

// Aggiorna una campagna
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goal, imageUrl, category } = req.body;
    
    console.log(`Richiesta di aggiornamento per la campagna ${id}:`, req.body);
    
    // Verifica se la campagna esiste
    const campaign = await Campaign.getById(id);
    if (!campaign) {
      console.log(`Campagna con ID ${id} non trovata`);
      return res.status(404).json({ message: 'Campagna non trovata.' });
    }
    
    console.log(`Campagna trovata:`, campaign);
    console.log(`Utente richiedente:`, req.user);
      // Verifica i permessi: un membro del team può modificare solo le sue campagne, un admin può modificare tutte
    if (req.user.role === 'team' && campaign.created_by != req.user.id) {
      console.log(`Accesso negato: l'utente team ${req.user.id} sta cercando di modificare una campagna creata da ${campaign.created_by}`);
      console.log(`Tipo di req.user.id: ${typeof(req.user.id)}, Tipo di campaign.created_by: ${typeof(campaign.created_by)}`);
      console.log(`Valori: req.user.id = ${req.user.id}, campaign.created_by = ${campaign.created_by}`);
      return res.status(403).json({ message: 'Non hai i permessi per modificare questa campagna.' });
    }
    
    // Se è un admin, ha pieno controllo
    console.log(`Permessi verificati: l'utente ${req.user.id} con ruolo ${req.user.role} può modificare la campagna creata da ${campaign.created_by}`);
    
    const updateData = {
      title,
      description,
      goal,
      imageUrl,
      category
    };
    
    console.log(`Dati di aggiornamento:`, updateData);
    
    const updated = await Campaign.update(id, updateData);
    
    if (!updated) {
      console.log(`Aggiornamento fallito per la campagna ${id}`);
      return res.status(500).json({ message: 'Impossibile aggiornare la campagna.' });
    }
    
    console.log(`Campagna ${id} aggiornata con successo`);
    res.json({ message: 'Campagna aggiornata con successo.' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della campagna:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento della campagna.' });
  }
};

// Elimina una campagna
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se la campagna esiste
    const campaign = await Campaign.getById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campagna non trovata.' });
    }
      // Verifica i permessi: un membro del team può eliminare solo le sue campagne, un admin può eliminare tutte
    if (req.user.role === 'team' && campaign.created_by != req.user.id) {
      console.log(`Accesso negato: l'utente team ${req.user.id} sta cercando di eliminare una campagna creata da ${campaign.created_by}`);
      console.log(`Tipo di req.user.id: ${typeof(req.user.id)}, Tipo di campaign.created_by: ${typeof(campaign.created_by)}`);
      console.log(`Valori: req.user.id = ${req.user.id}, campaign.created_by = ${campaign.created_by}`);
      return res.status(403).json({ message: 'Non hai i permessi per eliminare questa campagna.' });
    }
    
    // Se è un admin, ha pieno controllo
    console.log(`Permessi verificati: l'utente ${req.user.id} con ruolo ${req.user.role} può eliminare la campagna creata da ${campaign.created_by}`);
    
    const deleted = await Campaign.delete(id);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Impossibile eliminare la campagna.' });
    }
    
    res.json({ message: 'Campagna eliminata con successo.' });
  } catch (error) {
    console.error('Errore nell\'eliminazione della campagna:', error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione della campagna.' });
  }
};

// Ottieni le campagne create da un utente
exports.getCampaignsByUser = async (req, res) => {
  try {
    const campaigns = await Campaign.getByCreatedBy(req.user.id);
    res.json(campaigns);
  } catch (error) {
    console.error('Errore nel recupero delle campagne dell\'utente:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle campagne dell\'utente.' });
  }
};

// Ottieni le campagne create da uno specifico utente (per admin o per chi ha creato le campagne)
exports.getCampaignsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    
    // Se non è admin e non è il creatore, non può vedere le campagne
    if (req.user.role !== 'admin' && req.user.id !== parseInt(creatorId)) {
      return res.status(403).json({ message: 'Non hai i permessi per visualizzare queste campagne.' });
    }
    
    const campaigns = await Campaign.getByCreatedBy(creatorId);
    res.json(campaigns);
  } catch (error) {
    console.error('Errore nel recupero delle campagne del creatore:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle campagne del creatore.' });
  }
};
