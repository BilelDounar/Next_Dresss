import type { NextApiRequest, NextApiResponse } from 'next';
import { searchUsers } from '@/lib/services/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { q } = req.query;

    if (!q || Array.isArray(q) || (q as string).trim() === '') {
        return res.status(200).json([]);
    }

    try {
        const users = await searchUsers(q as string);
        return res.status(200).json(users);
    } catch (error) {
        console.error('API /users/search error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
