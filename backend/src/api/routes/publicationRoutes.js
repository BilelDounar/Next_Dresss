// backend/src/api/routes/publicationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');

// Configuration de Multer
const storage = multer.memoryStorage(); // Stocke les fichiers en mémoire
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB par fichier
});

const {
    getPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication,
    getArticlesByPublication,
    markPublicationAsViewed
} = require('../controllers/publicationController');

router
    .route('/')
    .get(getPublications)
    .post(
        upload.fields([
            { name: 'publicationPhoto', maxCount: 10 },
            { name: 'articlePhotos', maxCount: 10 } // Accepte jusqu'à 10 photos d'articles
        ]),
        createPublication
    );

router
    .route('/:id')
    .get(getPublicationById)
    .put(updatePublication)
    .delete(deletePublication);

router.route('/:id/view').post(markPublicationAsViewed);

router.route('/:id/articles').get(getArticlesByPublication);

// router.post('/publications', createPublication);

module.exports = router;
