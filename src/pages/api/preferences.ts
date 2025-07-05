// Fichier : src/pages/api/preferences.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { saveUserPreferences, UserPreferencesData } from '@/lib/services/preferencesService';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Schéma de validation avec Zod pour sécuriser les données entrantes
const preferencesSchema = z.object({
    gender: z.string().min(1, "Le genre est requis."),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD."),
    clothingStyles: z.array(z.string()).min(1, "Au moins un style doit être sélectionné."),
});

// Type pour le payload de notre token JWT
interface UserPayload {
    id: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // 1. Authentifier l'utilisateur via le cookie httpOnly
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        const userId = decoded.id;

        // 2. Valider le corps de la requête
        const parsedBody = preferencesSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: 'Données invalides', details: parsedBody.error.format() });
        }

        // 3. Appeler le service avec les données validées
        const preferencesData: UserPreferencesData = {
            userId,
            ...parsedBody.data,
        };

        const savedPreferences = await saveUserPreferences(preferencesData);

        // 4. Envoyer une réponse de succès
        return res.status(200).json({ message: 'Préférences enregistrées avec succès', data: savedPreferences });

    } catch (error) {
        console.error("Erreur dans l'API /api/preferences:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}