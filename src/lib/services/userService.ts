// lib/services/userService.ts
import { pool } from "../db";
import crypto from "crypto";
import { sendVerificationEmail } from "./mailService";

export interface NewUser {
    nom: string;
    prenom: string;
    pseudo: string;
    email: string;
    password_hash: string;
    // … autres champs si besoin
}

// Vérifie si un email existe (trim + lowercase)
export async function emailExists(email: string): Promise<boolean> {
    const { rows } = await pool.query<{ exists: boolean }>(
        `
    SELECT EXISTS(
      SELECT 1
      FROM public.users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
    ) AS exists
    `,
        [email]
    );
    return rows[0].exists;
}

/**
 * Récupère un utilisateur par son email.
 * @param email - L'email de l'utilisateur à récupérer.
 * @returns L'utilisateur trouvé, ou null s'il n'existe pas.
 */
export async function getUserByEmail(email: string): Promise<any | null> {
    const { rows } = await pool.query(
        `
    SELECT id, email, password_hash, status, email_verified
    FROM public.users
    WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
    `,
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
}

// Crée un nouvel utilisateur
export async function createUser(data: NewUser) {

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiresAt = new Date(Date.now() + 24 * 3600 * 1000);

    const {
        nom, prenom, pseudo, email, password_hash,
    } = data;
    const { rows } = await pool.query(
        `
    INSERT INTO public.users(
        nom, prenom, pseudo, email, password_hash, status, email_verified, followers_count, posts_count, verification_token, verification_expires_at, language, created_at, updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING id, nom, prenom, pseudo, email, email_verified
    `,
        [nom, prenom, pseudo, email.trim(), password_hash, "pending", false, 0, 0, verificationToken, verificationExpiresAt, "fr",]
    );

    // Envoyer l'e-mail de vérification
    await sendVerificationEmail(rows[0].email, verificationToken);

    return rows[0];
}

/**
 * Met à jour le token de vérification pour un utilisateur et renvoie l'e-mail.
 * @param userId - L'ID de l'utilisateur.
 * @returns Le nouveau token de vérification ou null si l'utilisateur n'est pas trouvé.
 */
export async function resetVerificationToken(userId: string): Promise<string | null> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 heures

    const { rows } = await pool.query(
        `
        UPDATE public.users
        SET 
            verification_token = $1,
            verification_expires_at = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING email
        `,
        [verificationToken, verificationExpiresAt, userId]
    );

    if (rows.length === 0) {
        return null; // Utilisateur non trouvé
    }

    const { email } = rows[0];

    // Renvoyer l'e-mail de vérification
    await sendVerificationEmail(email, verificationToken);

    return verificationToken;
}
