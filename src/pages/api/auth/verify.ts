// pages/api/auth/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.query as { token?: string };

    if (!token) return res.status(400).json({ error: "Token manquant" });

    // 1) Récupérer l'utilisateur par token
    const { rows } = await pool.query(`
    SELECT id, email_verified, verification_expires_at
    FROM public.users
    WHERE verification_token = $1
  `, [token]);

    if (rows.length === 0) {
        return res.status(404).json({ error: "Token invalide" });
    }

    const user = rows[0];
    const expiresAt = new Date(user.verification_expires_at);

    // 2) Vérifier l’expiration
    if (expiresAt < new Date()) {
        return res.status(410).json({
            error: "Token expiré",
            message: "Votre lien de vérification a expiré. Veuillez en demander un nouveau."
        });
    }

    // 3) Marquer comme vérifié
    await pool.query(`
    UPDATE public.users
    SET email_verified = TRUE,
        verification_token = NULL,
        verification_expires_at = NULL,
        updated_at = NOW()
    WHERE id = $1
  `, [user.id]);

    return res.status(200).json({ message: "Email vérifié avec succès" });
}
