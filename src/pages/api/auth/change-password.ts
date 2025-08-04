// pages/api/auth/change-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { pool } from '@/lib/db';
import { parse } from 'cookie';

const bodySchema = z.object({
    oldPassword: z.string().min(1, 'Ancien mot de passe requis'),
    newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { oldPassword, newPassword } = bodySchema.parse(req.body);

        // Récupération de l'utilisateur depuis le cookie JWT
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        const cookies = parse(cookieHeader);
        const token = cookies['auth_token'];
        if (!token) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        let payload: JwtPayload | string;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch {
            return res.status(401).json({ error: 'Token invalide' });
        }
        const userId = (typeof payload === 'object' && 'id' in payload) ? (payload as JwtPayload).id : undefined;
        if (!userId) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        // Vérifier l'ancien mot de passe
        const { rows } = await pool.query('SELECT password_hash FROM public.users WHERE id = $1', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const isValid = await bcrypt.compare(oldPassword, rows[0].password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
        }

        // Mettre à jour le nouveau mot de passe
        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE public.users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

        return res.status(200).json({ message: 'Mot de passe mis à jour' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors.map((e) => e.message).join(', ') });
        }
        console.error('Erreur change-password:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
