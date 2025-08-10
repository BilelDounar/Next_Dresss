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

export interface User {
    id: number;
    email: string;
    password_hash: string;
    status: 'pending' | 'active' | 'inactive';
    email_verified: boolean;
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
export async function getUserByEmail(email: string): Promise<User | null> {
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
        nom, prenom, pseudo, email, password_hash, role, status, email_verified, followers_count, posts_count, verification_token, verification_expires_at, language, created_at, updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING id, nom, prenom, pseudo, email, email_verified, status
    `,
        [nom, prenom, pseudo, email.trim(), password_hash, "user", "pending", false, 0, 0, verificationToken, verificationExpiresAt, "fr"]
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
export async function resetVerificationToken(userId: string | number): Promise<string | null> {
    // S'assurer que l'ID est un nombre pour la requête SQL
    let idParam: string | number = userId;
    // Si c'est une chaîne de chiffres, on la convertit en nombre, sinon on garde la chaîne (UUID)
    if (typeof userId === 'string' && /^[0-9]+$/.test(userId)) {
        idParam = parseInt(userId, 10);
    }

    if (!idParam) {
        console.warn('[resetVerificationToken] Invalid userId:', userId);
        return null;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 h

    const { rows } = await pool.query(
        `UPDATE public.users
         SET verification_token = $1,
             verification_expires_at = $2,
             updated_at = NOW()
         WHERE id = $3
           AND email_verified = false -- seulement si non vérifié
         RETURNING email`,
        [verificationToken, verificationExpiresAt, idParam]
    );

    if (rows.length === 0) {
        console.warn('[resetVerificationToken] No user updated for id', idParam);
        return null; // Utilisateur introuvable ou déjà vérifié
    }

    const { email } = rows[0];

    // Envoi de l'e-mail de vérification
    await sendVerificationEmail(email, verificationToken);

    return verificationToken;
}

/**
 * Récupère le pseudo d'un utilisateur par son ID.
 * @param userId - L'ID de l'utilisateur.
 * @returns Le pseudo de l'utilisateur, ou null s'il n'est pas trouvé.
 */
export async function findUserPseudoById(userId: string): Promise<string | null> {
    try {
        const { rows } = await pool.query(
            'SELECT pseudo FROM public.users WHERE id = $1',
            [userId]
        );
        return rows.length > 0 ? rows[0].pseudo : null;
    } catch (error) {
        console.error('Error fetching user pseudo by ID:', error);
        throw error; // ou retourner null selon la gestion d'erreur souhaitée
    }
}

/**
 * Recherche des utilisateurs par pseudo, nom ou prénom (insensible à la casse).
 * @param query Chaîne recherchée
 * @returns Liste d'utilisateurs (id, nom, prenom, pseudo, profile_picture_url)
 */
export async function searchUsers(query: string) {
    const like = `%${query}%`;
    const { rows } = await pool.query(
        `SELECT id, nom, prenom, pseudo, profile_picture_url
         FROM public.users
         WHERE pseudo ILIKE $1 OR nom ILIKE $1 OR prenom ILIKE $1
         ORDER BY pseudo ASC
         LIMIT 10`,
        [like]
    );
    return rows;
}

// ---------------------------------------------
// Update Profile
// ---------------------------------------------
export interface UpdateUserProfileInput {
    userId: string;
    pseudo?: string;
    bio?: string;
    profile_picture_url?: string;
    nom?: string;
    prenom?: string;
}

/**
 * Met à jour les informations de profil d'un utilisateur.
 * Seuls les champs fournis dans l'input seront mis à jour.
 */
export async function updateUserProfile({ userId, pseudo, bio, profile_picture_url, nom, prenom }: UpdateUserProfileInput) {
    // Exécuter un update unique : chaque champ n'est modifié que si un nouveau
    // paramètre est fourni, grâce à COALESCE(param, colonne).
    const query = `
        UPDATE public.users
        SET
            pseudo               = COALESCE($2, pseudo),
            bio                  = COALESCE($3, bio),
            profile_picture_url  = COALESCE($4, profile_picture_url),
            nom                  = COALESCE($5, nom),
            prenom               = COALESCE($6, prenom),
            updated_at           = NOW()
        WHERE id = $1
        RETURNING id, nom, prenom, pseudo, bio, profile_picture_url, followers_count`;

    const params = [
        userId,
        pseudo ?? null,
        bio ?? null,
        profile_picture_url ?? null,
        nom ?? null,
        prenom ?? null,
    ];

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
        console.warn('[updateUserProfile] Aucune ligne mise à jour pour id', userId);
        return null;          // fera renvoyer 404 dans l’API
    }
    console.log('[updateUserProfile] Nouvelle ligne :', rows[0]);
    return rows[0];
}
