// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { getUserByEmail } from '@/lib/services/userService';

const loginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(1, { message: "Le mot de passe ne peut pas être vide" }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Mot de passe incorrect.' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                status: user.status,
                email_verified: user.email_verified
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' } // Le token expire dans 7 jours
        );

        // Définir le cookie
        const cookie = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 semaine
            path: '/',
        });

        res.setHeader('Set-Cookie', cookie);

        const { password_hash, verification_token, verification_expires_at, ...userResponse } = user;

        return res.status(200).json(userResponse);

    } catch (error) {
        console.log("[ERREUR] Une erreur s'est produite pendant la connexion.");
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
        }
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
}
