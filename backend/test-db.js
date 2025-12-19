// test-db.js
const pool = require("./config/db");

async function testConnection() {
  try {
    // Tenta di ottenere una connessione dal pool
    const connection = await pool.getConnection();
    console.log("Connessione al database riuscita!");

    // Tenta di eseguire una query di test
    const [rows] = await connection.query("SELECT 1 as test");
    console.log("Query di test eseguita con successo:", rows);

    // Rilascia la connessione
    connection.release();

    // Verifica che il database abbia le tabelle necessarie
    try {
      const [tables] = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${process.env.DB_NAME}'
      `);

      console.log("Tabelle nel database:");
      tables.forEach((table) => {
        console.log(` - ${table.TABLE_NAME}`);
      });

      // Verifica tabelle specifiche
      const requiredTables = [
        "users",
        "campaigns",
        "donations",
        "password_reset_tokens",
        "registration_codes",
      ];
      const missingTables = requiredTables.filter(
        (reqTable) =>
          !tables.some(
            (t) => t.TABLE_NAME.toLowerCase() === reqTable.toLowerCase()
          )
      );

      if (missingTables.length > 0) {
        console.log("Tabelle mancanti:", missingTables.join(", "));
      } else {
        console.log("Tutte le tabelle necessarie sono presenti");
      }
    } catch (error) {
      console.error("Errore durante la verifica delle tabelle:", error.message);
    }
  } catch (error) {
    console.error("Errore di connessione al database:", error.message);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("Controlla le credenziali dell'utente nel file .env");
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        "Il server MySQL non è in esecuzione o non è raggiungibile all'indirizzo specificato"
      );
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error(`Il database "${process.env.DB_NAME}" non esiste`);
    }
  } finally {
    // Chiudi il pool
    pool.end();
  }
}

testConnection();
