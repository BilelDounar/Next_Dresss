// src/pages/api/auth/resend-verification.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { resetVerificationToken } from '@/lib/services/userService';

interface JwtPayload {
    id?: string | number;
    userId?: string | number;
    email?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    console.log('\n--- Début de la requête de renvoi de vérification ---');

    const token = req.cookies.auth_token;

    if (!token) {
        console.log('[ERREUR] Aucun token d\'authentification trouvé dans les cookies.');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    console.log('[1] Token trouvé dans les cookies.');

    try {
        console.log('[2] Décodage du token JWT...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        // compatibilité : certains tokens portent "id" au lieu de "userId"
        const userId = decoded.userId ?? decoded.id;
        console.log(`[3] Token décodé avec succès. UserID: ${userId}`);

        if (!userId) {
            console.log('[ERREUR] Aucun userId dans le token.');
            return res.status(400).json({ error: 'Invalid token payload' });
        }

        console.log('[4] Appel de resetVerificationToken...');
        const new_token = await resetVerificationToken(userId);

        if (!new_token) {
            console.log('[ERREUR] resetVerificationToken a échoué (utilisateur non trouvé ou erreur de mise à jour).');
            return res.status(404).json({ error: 'User not found or unable to update token.' });
        }
        console.log('[5] Nouveau token de vérification créé et e-mail envoyé.');

        return res.status(200).json({ message: 'Verification email sent successfully.' });

    } catch (error) {
        console.error("Resend verification error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            console.log('[ERREUR] Le token JWT est invalide.');
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.log('[ERREUR] Une erreur interne s\'est produite.');
        return res.status(500).json({ error: 'An internal error occurred.' });
    }
}
