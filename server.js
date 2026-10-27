require("dotenv").config();
const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const app = express();
const port = Number(process.env.PORT || 3000);
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined }) : null;
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));
app.get("/api/health", async (_req, res) => {
 if (!pool) return res.status(503).json({status:"not_configured",database:false,message:"Configura DATABASE_URL en las variables de entorno."});
 try { await pool.query("SELECT 1"); res.json({status:"ok",database:true,service:"SIGPM API"}); }
 catch (error) { console.error("PostgreSQL health check:", error.message); res.status(503).json({status:"error",database:false,message:"No se pudo conectar con PostgreSQL."}); }
});
app.get("/api/*", (_req,res) => res.status(404).json({error:"Endpoint API aún no implementado."}));
app.get("*", (req,res,next) => { if(req.path.startsWith("/api/")) return res.status(404).json({error:"Ruta API no encontrada."}); res.sendFile(path.join(__dirname,"index.html"), error => error && next(error)); });
app.use((error,_req,res,_next) => { console.error(error.message); res.status(500).json({error:"Error interno del servidor."}); });
if (require.main === module) app.listen(port, () => console.log(`SIGPM ejecutándose en http://localhost:${port}`));
module.exports = app;
