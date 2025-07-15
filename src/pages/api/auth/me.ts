// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '@/lib/services/userService';

interface JwtPayload {
    userId: string;
    email: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        const user = await getUserByEmail(decoded.email);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { ...userResponse } = user;

        return res.status(200).json(userResponse);
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
