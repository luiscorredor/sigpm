require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Configura PostgreSQL en .env.");
  process.exit(1);
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined
});
(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "..", "database", "schema.sql"), "utf8");
    await pool.query(sql);
    console.log("Esquema de SIGPM creado/verificado correctamente.");
  } catch (error) {
    console.error("Error ejecutando el esquema:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
