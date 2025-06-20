@echo off
echo Script di diagnostica per donazioni e dashboard utente

echo.
echo === TEST CONNESSIONE AL DATABASE ===
node test-db.js
if %errorlevel% neq 0 (
  echo ERRORE: La connessione al database non funziona correttamente!
  exit /b %errorlevel%
)

echo.
echo === TEST DONAZIONI UTENTE ===
echo Inserisci l'ID dell'utente da verificare (lascia vuoto per usare ID=1):
set /p userId=ID utente: 

if "%userId%"=="" (
  set userId=1
)

node test-user-donations.js %userId%

echo.
echo === VERIFICA JWT TOKEN ===
echo Verifica che il JWT_SECRET sia configurato nel file .env:
findstr /C:"JWT_SECRET" .env

echo.
echo === VERIFICA MIDDLEWARE DI AUTENTICAZIONE ===
echo Controlla che il middleware auth sia correttamente configurato nelle routes:
echo.
type routes\donation.routes.js | findstr /C:"authMiddleware"

echo.
echo === VERIFICA ENDPOINTS ===
echo Controlla i log del server per verificare che il backend riceva correttamente le richieste.
echo Per avviare il server con log dettagliati, esegui:
echo    node server.js --debug
echo.
echo Diagnostica completata!
pause
