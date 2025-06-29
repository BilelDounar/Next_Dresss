// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // On cite la table et les colonnes exactement comme dans PostgreSQL
      const { rows } = await pool.query(`
        SELECT * FROM public.users
      `);
      return res.status(200).json(rows);
    }

    // … votre code POST ou autres méthodes …

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API /users error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
