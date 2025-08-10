// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../lib/db";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import { updateUserProfile } from "../../lib/services/userService";

// Désactiver le bodyParser intégré pour pouvoir gérer multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { id } = req.query;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "L'ID de l'utilisateur est invalide ou manquant" });
      }

      // Étape 1 : Requête simplifiée pour le diagnostic
      const userQuery = `SELECT * FROM public.users WHERE id = $1;`;

      const { rows } = await pool.query(userQuery, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      // On ajoute des valeurs par défaut pour ne pas casser le frontend
      const userProfile = {
        ...rows[0],
      };

      return res.status(200).json(userProfile);
    }

    // ---------------------------------------
    // PUT – mise à jour du profil utilisateur
    // ---------------------------------------
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID utilisateur invalide ou manquant" });
      }

      // Utiliser formidable pour parser le FormData (photo + champs texte)
      const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 5 MB

      try {
        const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            console.log('[PUT /api/users] fields reçus =>', fields);
            resolve({ fields, files });
          });

        });

        // --- Extraction fiable des champs texte (formidable renvoie souvent un tableau)
        const parseField = (val: unknown): string | undefined => {
          if (typeof val === 'string') return val;
          if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
          return undefined;
        };

        const pseudo = parseField((fields as Record<string, unknown>).pseudo);
        const bio = parseField((fields as Record<string, unknown>).bio);
        const nom = parseField((fields as Record<string, unknown>).nom);
        const prenom = parseField((fields as Record<string, unknown>).prenom);

        let profile_picture_url: string | undefined;
        let previousPhoto: string | null = null;

        // Support either single file or array returned by formidable
        const uploadedFileField = (files as formidable.Files)['photo'];
        const uploadedFile = Array.isArray(uploadedFileField)
          ? uploadedFileField[0]
          : (uploadedFileField as formidable.File | undefined);
        if (uploadedFile) {
          // Récupérer l'URL actuelle pour supprimer l'ancienne image (si on en télécharge une nouvelle)
          const prevRes = await pool.query('SELECT profile_picture_url FROM public.users WHERE id = $1', [id]);
          previousPhoto = prevRes.rows[0]?.profile_picture_url ?? null;

          // On stocke désormais toutes les images dans /public/uploads
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          await fs.promises.mkdir(uploadsDir, { recursive: true });
          const fileExt = path.extname(uploadedFile.originalFilename || "");

          // Génération d'un nom unique : <id>-profil-<horodatage>-<6car random>
          const now = new Date();
          const pad = (n: number) => n.toString().padStart(2, "0");
          const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
          const randomStr = Math.random().toString(36).substring(2, 8); // 6 caractères aléatoires
          const filename = `${id}-profil-${timestamp}-${randomStr}${fileExt}`;

          const destPath = path.join(uploadsDir, filename);
          await fs.promises.rename(uploadedFile.filepath, destPath);
          profile_picture_url = `/uploads/${filename}`;
        }

        const updated = await updateUserProfile({
          userId: id as string,
          pseudo,
          bio,
          profile_picture_url,
          nom,
          prenom,
        });

        if (!updated) {
          return res.status(404).json({ error: 'Utilisateur non trouvé ou données identiques' });
        }

        // Supprimer l'ancienne photo si elle existait et qu'une nouvelle a bien été enregistrée
        if (uploadedFile && previousPhoto && previousPhoto.startsWith('/uploads/')) {
          try {
            const oldPath = path.join(process.cwd(), 'public', previousPhoto);
            await fs.promises.unlink(oldPath);
          } catch (err) {
            console.warn('Impossible de supprimer l\'ancienne photo:', err);
          }
        }

        return res.status(200).json(updated);
      } catch (err) {
        console.error('Erreur traitement PUT /api/users:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      // La réponse a déjà été envoyée
      return;
    }

    // ---------------------------------------
    // DELETE – suppression du compte utilisateur
    // ---------------------------------------
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "ID utilisateur invalide ou manquant" });
        return;
      }

      try {
        // Supprime l'utilisateur. Vous pouvez également ajouter la suppression cascade d'autres tables si nécessaire.
        const { rowCount } = await pool.query('DELETE FROM public.users WHERE id = $1', [id]);

        if (rowCount === 0) {
          res.status(404).json({ error: "Utilisateur non trouvé" });
          return;
        }

        // 204 No Content : la ressource a été supprimée avec succès, aucune réponse JSON
        res.status(204).end();
        return;
      } catch (err) {
        console.error('Erreur DELETE /api/users:', err);
        res.status(500).json({ error: 'Erreur serveur' });
        return;
      }
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API /users error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
