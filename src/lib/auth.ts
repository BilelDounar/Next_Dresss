import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import type { NextApiResponse } from 'next';

// Interface pour le payload du token
interface TokenPayload {
    userId: string;
    email: string;
    status: string;
    email_verified: boolean;
}

// Récupère la clé secrète ou lève une erreur si non définie
function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("La variable d'environnement JWT_SECRET est manquante.");
    }
    return secret;
}

// Fonction pour générer un token
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '30d' });
}

// Fonction pour définir le cookie d'authentification
export function setAuthCookie(res: NextApiResponse, token: string) {
    const cookie = serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 1 mois
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
}
