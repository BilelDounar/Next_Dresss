import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserPseudoById } from '@/lib/services/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    try {
        const pseudo = await findUserPseudoById(id);
        if (pseudo) {
            res.status(200).json({ pseudo });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
