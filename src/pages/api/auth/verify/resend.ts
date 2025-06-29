// pages/api/auth/verify/resend.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/services/mailService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: "Email manquant" });

    const { rows } = await pool.query(`
    SELECT id, email_verified FROM public.users WHERE email = $1`,
        [email.trim().toLowerCase()]);

    if (rows.length === 0) {
        return res.status(404).json({ error: "Email inconnu" });
    }
    if (rows[0].email_verified) {
        return res.status(400).json({ error: "Email déjà vérifié" });
    }

    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpires = new Date(Date.now() + 24 * 3600 * 1000);

    await pool.query(`
    UPDATE public.users
    SET verification_token = $1,
        verification_expires_at = $2,
        updated_at = NOW()
    WHERE id = $3`,
        [newToken, newExpires, rows[0].id]);

    await sendVerificationEmail(email, newToken);

    return res.status(200).json({ message: "Un nouvel email de vérification a été envoyé." });
}
