import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import type { NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('La variable d\'environnement JWT_SECRET est manquante.');
}

// Interface pour le payload du token
interface TokenPayload {
    userId: string;
    email: string;
    status: string;
    email_verified: boolean;
}

// Fonction pour générer un token
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
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
