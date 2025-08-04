import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { userId, delta } = req.body as { userId?: number | string; delta?: number };

    if (!userId || typeof delta !== "number" || ![-1, 1].includes(delta)) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }

    // Update followers_count atomically
    const query = `UPDATE public.users SET followers_count = GREATEST(followers_count + $1, 0), updated_at = NOW() WHERE id = $2 RETURNING followers_count`;
    const { rows } = await pool.query(query, [delta, userId]);

    if (rows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });

    return res.status(200).json({ followers_count: rows[0].followers_count });
  } catch (error) {
    console.error("API followers error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
