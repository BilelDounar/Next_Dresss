// Fichier : src/lib/services/preferencesService.ts

import { pool } from '@/lib/db';

// Type pour les données de préférences que nous allons manipuler
export interface UserPreferencesData {
    userId: number;
    gender: string;
    birthDate: string; // Le format attendu est 'YYYY-MM-DD'
    clothingStyles: string[];
}

/**
 * Enregistre les préférences d'un utilisateur dans la base de données
 * et met à jour le statut de l'utilisateur de 'pending' à 'active'.
 * L'opération est transactionnelle pour garantir la cohérence.
 *
 * @param preferences - Les données de préférences à enregistrer.
 * @returns Les préférences qui ont été enregistrées.
 */
export async function saveUserPreferences(preferences: UserPreferencesData) {
    const { userId, gender, birthDate, clothingStyles } = preferences;

    const client = await pool.connect(); // Obtient un client du pool de connexions

    try {
        await client.query('BEGIN'); // Démarre la transaction

        // Étape 1: Insérer les préférences ou les mettre à jour si elles existent déjà
        const preferencesQuery = `
            INSERT INTO user_preferences (user_id, gender, birth_date, clothing_styles)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE
            SET gender = EXCLUDED.gender,
                birth_date = EXCLUDED.birth_date,
                clothing_styles = EXCLUDED.clothing_styles,
                updated_at = NOW()
            RETURNING *;
        `;
        const preferencesResult = await client.query(preferencesQuery, [userId, gender, birthDate, clothingStyles]);

        // Étape 2: Mettre à jour le statut de l'utilisateur pour le marquer comme 'active'
        const updateUserQuery = `
            UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1;
        `;
        await client.query(updateUserQuery, [userId]);

        await client.query('COMMIT'); // Valide la transaction

        return preferencesResult.rows[0];

    } catch (error) {
        await client.query('ROLLBACK'); // Annule la transaction en cas d'erreur
        console.error("Erreur lors de la transaction pour enregistrer les préférences :", error);
        // Propage l'erreur pour que l'API puisse la gérer
        throw new Error("Impossible d'enregistrer les préférences de l'utilisateur.");
    } finally {
        client.release(); // Libère le client pour qu'il retourne au pool
    }
}