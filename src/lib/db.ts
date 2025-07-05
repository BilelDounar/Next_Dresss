// lib/db.ts
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error("Définir DATABASE_URL dans .env");
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // En production, activez SSL si nécessaire :
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});

pool.on("error", (err) => {
    console.error("Erreur sur le client pg :", err);
    process.exit(-1);
});
