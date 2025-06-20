const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes.js');
const campaignRoutes = require('./routes/campaign.routes.js');
const donationRoutes = require('./routes/donation.routes.js');
const userRoutes = require('./routes/user.routes.js');
const debugRoutes = require('./test-campaign-debug.js');

// Inizializzazione app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging di base
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/debug', debugRoutes);

// Route base
app.get('/', (req, res) => {
  res.json({ message: 'Benvenuto nell\'API di DONACTION!' });
});

// Route di ping per test di connessione
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Gestione errori 404
app.use((req, res) => {
  res.status(404).json({ message: 'Risorsa non trovata' });
});

// Gestione errori globale
app.use((err, req, res, next) => {
  console.error('Errore:', err);
  res.status(500).json({
    message: 'Si è verificato un errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
