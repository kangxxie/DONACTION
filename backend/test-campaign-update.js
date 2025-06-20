// test-campaign-update.js
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:8080/api';
let token = null;
let userId = null;
const campaignId = 1; // Cambia con un ID di campagna valido nel tuo database

// Test di ping per verificare se il server è raggiungibile
async function pingServer() {
  try {
    const response = await axios.get(`${API_URL}/ping`);
    console.log('Ping server:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel ping del server:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⛔ Il server non è raggiungibile. Assicurati che sia in esecuzione.');
    }
    return null;
  }
}

// Funzione per effettuare il login e ottenere un token
async function login() {
  try {
    // Prima prova con un utente admin
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@donaction.it',  // Sostituire con un utente admin valido
      password: 'admin123'         // Sostituire con la password corretta
    });
    
    token = response.data.token;
    userId = response.data.user.id;
    
    console.log('Login effettuato con successo');
    console.log('User ID:', userId);
    console.log('Role:', response.data.user.role);
    
    return { token, userId, user: response.data.user };
  } catch (error) {
    console.error('Errore durante il login:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Test recupero dettagli campagna
async function getCampaign(id) {
  try {
    const response = await axios.get(`${API_URL}/campaigns/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    console.log('\n=== DETTAGLI CAMPAGNA ===');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero della campagna:', error.response?.data || error.message);
    return null;
  }
}

// Test aggiornamento campagna
async function updateCampaign(id, campaignData) {
  try {
    console.log('\n=== AGGIORNAMENTO CAMPAGNA ===');
    console.log('Dati da inviare:', campaignData);
    
    const response = await axios.put(`${API_URL}/campaigns/${id}`, campaignData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Risposta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento della campagna:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
    return null;
  }
}

// Esegui tutti i test in sequenza
async function runTests() {
  // Verifica che il server sia raggiungibile
  const pingResult = await pingServer();
  if (!pingResult) {
    console.error('Test interrotti: server non raggiungibile');
    return;
  }
  
  // Login
  const { token, user } = await login();
  
  // Recupera dati campagna
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    console.error(`Test interrotti: campagna con ID ${campaignId} non trovata`);
    return;
  }
  
  // Modifica alcuni dati della campagna
  const updatedData = {
    title: campaign.title + ' (Modificato)',
    description: campaign.description,
    goal: campaign.goal,
    imageUrl: campaign.imageUrl,
    category: campaign.category
  };
  
  // Prova ad aggiornare la campagna
  await updateCampaign(campaignId, updatedData);
  
  // Verifica che l'aggiornamento sia avvenuto correttamente
  const updatedCampaign = await getCampaign(campaignId);
  
  if (updatedCampaign && updatedCampaign.title === updatedData.title) {
    console.log('\n✅ Aggiornamento completato con successo!');
  } else {
    console.log('\n⛔ Aggiornamento non completato.');
  }
}

runTests();
