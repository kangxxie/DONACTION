// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // per body JSON

// Import route modules
const campaignRoutes = require('./routes/campaign.routes');
const donationRoutes = require('./routes/donation.routes');

// Base URL per le API
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);

// Root endpoint di test
app.get('/', (req, res) => {
  res.send('API Donaction attiva');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});



