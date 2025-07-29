const multer = require('multer');

// Utilise la mémoire pour stocker les fichiers temporairement.
// Pour une application en production, il est conseillé d'utiliser un stockage sur disque ou dans le cloud.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB par fichier
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers de type image sont autorisés.'), false);
        }
    }
});

// Ce middleware est configuré pour gérer deux types de champs de fichiers :
// - 'photos': pour les photos principales de la publication (jusqu'à 10)
// - 'articlePhotos': pour les photos de chaque article
const uploadPublicationFiles = upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'articlePhotos', maxCount: 50 } // On met une limite haute pour les articles
]);

module.exports = uploadPublicationFiles;
