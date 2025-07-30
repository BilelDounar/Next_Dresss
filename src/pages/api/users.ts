// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { id } = req.query;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "L'ID de l'utilisateur est invalide ou manquant" });
      }

      // Étape 1 : Requête simplifiée pour le diagnostic
      const userQuery = `SELECT * FROM public.users WHERE id = $1;`;

      const { rows } = await pool.query(userQuery, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      // On ajoute des valeurs par défaut pour ne pas casser le frontend
      const userProfile = {
        ...rows[0],
      };

      return res.status(200).json(userProfile);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API /users error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
