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

    console.log("\n--- Début de la requête de connexion ---");

    try {
        const { email, password } = loginSchema.parse(req.body);
        console.log(`[1] Tentative de connexion pour l'email: ${email}`);

        const user = await getUserByEmail(email);
        if (!user) {
            console.log("[ERREUR] Aucun utilisateur trouvé avec cet email.");
            return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
        }

        console.log("[2] Utilisateur trouvé dans la BDD:", { id: user.id, email: user.email, status: user.status });
        console.log(`[3] Hash du mot de passe depuis la BDD (longueur): ${user.password_hash ? user.password_hash.length : 'null'}`);

        console.log("[4] Comparaison des mots de passe en cours...");
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log(`[5] Résultat de la comparaison (isPasswordValid): ${isPasswordValid}`);

        if (!isPasswordValid) {
            console.log("[ERREUR] La comparaison des mots de passe a échoué.");
            return res.status(401).json({ error: 'Mot de passe incorrect.' });
        }

        console.log("[6] Connexion réussie. Création du token JWT...");

        // Créer le token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                status: user.status,
                email_verified: user.email_verified
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' } // Le token expire dans 7 jours
        );

        console.log("[7] Token JWT créé avec succès.");

        // Définir le cookie
        const cookie = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 semaine
            path: '/',
        });

        console.log("[8] Cookie défini avec succès.");

        res.setHeader('Set-Cookie', cookie);

        const { password_hash, verification_token, verification_expires_at, ...userResponse } = user;

        console.log("[9] Réponse utilisateur préparée.");

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
