// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { emailExists, createUser } from "@/lib/services/userService";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { z } from "zod";

// Schéma de validation pour l'inscription
const registerSchema = z.object({
    nom: z.string().trim().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    prenom: z.string().trim().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
    pseudo: z.string().trim().min(3, { message: "Le pseudo doit contenir au moins 3 caractères" }),
    email: z.string().email({ message: "Email invalide" }).trim().toLowerCase(),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // 1) Valider les données avec Zod
        const { nom, prenom, pseudo, email, password } = registerSchema.parse(req.body);

        // 2) Vérifier si l’email existe déjà
        if (await emailExists(email)) {
            return res.status(409).json({ error: "Cet email est déjà utilisé" });
        }

        // 3) Hasher le mot de passe
        const password_hash = await bcrypt.hash(password, 10);

        // 4) Créer l’utilisateur
        const newUser = await createUser({
            nom, prenom, pseudo, email, password_hash
        });

        // 5) Générer le token JWT
        const token = jwt.sign(
            {
                id: newUser.id,
                status: newUser.status, // Sera 'pending' par défaut
                email_verified: newUser.email_verified,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        // 6) Définir le cookie d'authentification
        const cookie = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 semaine
            path: '/',
        });

        res.setHeader('Set-Cookie', cookie);

        // Envoyer le cookie
        // setTokenCookie(res, token);

        // Répondre avec le statut de l'utilisateur pour la redirection
        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            status: newUser.status,
            userId: newUser.id
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
        }
        console.error("Heure:", new Date().toISOString());
        console.error("Requête:", req.body);
        console.error("Erreur:", error);
        console.error("--- FIN ERREUR API INSCRIPTION ---\n");

        // Toujours renvoyer l'erreur détaillée pour le débogage
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ error: `Erreur interne du serveur: ${errorMessage}` });
    }
}
