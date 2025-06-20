// test-donation-endpoint.js
// Script per testare l'endpoint delle donazioni

const axios = require('axios');

// Dati di test per la donazione
const testDonation = {
  campaign_id: 1, // Assicurati che esista una campagna con questo ID nel tuo database
  amount: 10.00,
  donor_name: "Test Donor",
  email: "testdonor@example.com",
  payment_method: "card"
};

// URL dell'endpoint API
const apiUrl = 'http://localhost:8080/api/donations';

// Funzione per testare la creazione di una donazione
async function testCreateDonation() {
  try {
    console.log('Test creazione donazione');
    console.log('Dati inviati:', testDonation);
    
    const response = await axios.post(apiUrl, testDonation);
    
    console.log('Risposta:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Errore nella creazione della donazione:');
    if (error.response) {
      // La richiesta è stata effettuata e il server ha risposto con un codice di stato
      // che non rientra nell'intervallo 2xx
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta alcuna risposta
      console.log('Nessuna risposta ricevuta:', error.request);
    } else {
      // Si è verificato qualcosa durante l'impostazione della richiesta che ha generato un errore
      console.log('Errore:', error.message);
    }
    
    return null;
  }
}

// Esegui il test
testCreateDonation().then(result => {
  if (result) {
    console.log('\nTest completato con successo!');
  } else {
    console.log('\nTest fallito.');
  }
});
