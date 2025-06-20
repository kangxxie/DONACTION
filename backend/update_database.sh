#!/bin/bash

echo "Esecuzione degli script SQL per configurare DONACTION..."
echo ""
echo "Assicurati che il server MySQL sia in esecuzione e inserisci la password quando richiesto."
echo ""

# Chiedi i dettagli di connessione al database
read -p "Inserisci il nome utente MySQL (default: donaction_u): " DB_USER
DB_USER=${DB_USER:-donaction_u}

# Esegui lo script di configurazione dei codici di registrazione
echo ""
echo "Aggiunta dei codici di registrazione..."
mysql -u $DB_USER -p donaction < add_registration_codes.sql

# Esegui lo script per sistemare i dati delle donazioni
echo ""
echo "Sistemazione dei dati delle donazioni..."
mysql -u $DB_USER -p donaction < fix_donation_data.sql

echo ""
echo "Operazioni completate! Il database è stato aggiornato."
echo ""
