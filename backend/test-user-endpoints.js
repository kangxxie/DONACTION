// test-user-endpoints.js
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:8080/api';
let token = null;
let userId = null;

// Funzione per effettuare il login e ottenere un token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',  // Sostituire con un utente valido nel tuo database
      password: 'password123'     // Sostituire con la password corretta
    });
    
    token = response.data.token;
    userId = response.data.user.id;
    
    console.log('Login effettuato con successo');
    console.log('User ID:', userId);
    console.log('Token:', token);
    
    return { token, userId };
  } catch (error) {
    console.error('Errore durante il login:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Test recupero profilo utente
async function testGetUserProfile(userId, token) {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n=== PROFILO UTENTE ===');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error.response?.data || error.message);
  }
}

// Test statistiche utente
async function testGetUserStats(userId, token) {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n=== STATISTICHE UTENTE ===');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error.response?.data || error.message);
  }
}

// Test aggiornamento profilo utente
async function testUpdateProfile(userId, token) {
  try {
    // Recupera prima i dati attuali per non modificarli troppo
    const currentData = await testGetUserProfile(userId, token);
    const userData = currentData.user;
    
    const updateData = {
      nome: userData.name,
      email: userData.email
    };
    
    console.log('\n=== AGGIORNAMENTO PROFILO ===');
    console.log('Dati da inviare:', updateData);
    
    const response = await axios.put(`${API_URL}/users/${userId}/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Risposta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento del profilo:', error.response?.data || error.message);
  }
}

// Esegui tutti i test in sequenza
async function runTests() {
  const { token, userId } = await login();
  
  await testGetUserProfile(userId, token);
  await testGetUserStats(userId, token);
  await testUpdateProfile(userId, token);
  
  console.log('\nTest completati!');
}

runTests();
