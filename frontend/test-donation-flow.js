/**
 * Script per testare il flusso di donazione
 * Eseguirlo nel browser tramite la console degli strumenti di sviluppo
 */

(function () {
  console.log("=== TEST DEL FLUSSO DI DONAZIONE ===");

  // 1. Verifica lo stato di autenticazione
  function testAuthState() {
    console.log("1. Verifica dello stato di autenticazione");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");

    console.log("Token JWT:", token ? "Presente" : "Assente");
    console.log(
      "Utente:",
      user
        ? `Autenticato come ${user.name} (${user.email}, ruolo: ${user.role})`
        : "Non autenticato"
    );

    return { token, user };
  }

  // 2. Verifica che l'interceptor HTTP aggiunga correttamente l'header Authorization
  function testInterceptor() {
    console.log("\n2. Test dell'interceptor HTTP");
    const originalFetch = window.fetch;

    // Sovrascriviamo temporaneamente fetch per verificare gli header
    window.fetch = function (...args) {
      const [url, options = {}] = args;

      console.log(`Richiesta intercettata a ${url}`);
      console.log(
        "Headers presenti:",
        options.headers ? "Presenti" : "Assenti"
      );

      if (options.headers) {
        const authHeader = options.headers.get("Authorization");
        console.log(
          "Authorization header:",
          authHeader ? `Presente ${authHeader}` : "Assente"
        );
      }

      return originalFetch.apply(this, args);
    };

    // Ripristina fetch originale dopo 5 secondi
    setTimeout(() => {
      window.fetch = originalFetch;
      console.log("Ripristinato fetch originale");
    }, 5000);
  }

  // 3. Test della chiamata API diretta per le donazioni utente
  async function testDonationsAPI() {
    console.log("\n3. Test diretto API donazioni utente");
    const { token } = testAuthState();

    if (!token) {
      console.log("Test fallito: Token JWT non presente");
      return;
    }

    try {
      const response = await fetch("/api/donations/user/my-donations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log(`API response: ${response.status} ${response.statusText}`);
        return;
      }

      const donations = await response.json();
      console.log(`Donazioni recuperate: ${donations.length}`);
      console.log("Dati donazioni:", donations);
    } catch (error) {
      console.error("Errore nel test API:", error);
    }
  }

  // 4. Monitoraggio aggiornamenti al BehaviorSubject nel service
  function monitorDonationService() {
    console.log("\n4. Monitoraggio DonationService");
    console.log(
      "ATTENZIONE: Questa funzione deve essere eseguita DOPO che il componente è stato caricato"
    );
    console.log("Per usarla, naviga prima alla dashboard utente, poi esegui:");
    console.log("monitorDonationService()");

    // Cerca l'istanza del servizio nel componente attivo
    const appRoot = document.querySelector("app-root");
    if (!appRoot || !appRoot.__ngContext__) {
      console.log("Impossibile trovare il contesto Angular");
      return;
    }

    console.log(
      "Servizio monitorato. Controlla gli aggiornamenti donazioni nella console."
    );
  }

  // Esponi le funzioni di test nel namespace globale
  window.testAuthState = testAuthState;
  window.testInterceptor = testInterceptor;
  window.testDonationsAPI = testDonationsAPI;
  window.monitorDonationService = monitorDonationService;

  // Esegui i test in sequenza
  testAuthState();
  testInterceptor();
  setTimeout(() => testDonationsAPI(), 1000);

  console.log("\n=== FINE DEI TEST AUTOMATICI ===");
  console.log("Usa le funzioni esposte per ulteriori test manuali:");
  console.log("- testAuthState()");
  console.log("- testInterceptor()");
  console.log("- testDonationsAPI()");
  console.log("- monitorDonationService()");
})();
