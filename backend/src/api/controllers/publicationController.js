const Publication = require('../models/publicationModel');
const Article = require('../models/articleModel');

// @desc    Créer une publication
// @route   POST /api/publications
exports.createPublication = async (req, res) => {
    try {
        const { description, articles, user, urlsPhotos } = req.body;
        const publication = await Publication.create({ description, user, urlsPhotos });
        let createdArticles = [];
        if (Array.isArray(articles) && articles.length > 0) {
            const articlesToCreate = articles.map(article => ({
                ...article,
                publicationId: publication._id,
                user
            }));
            createdArticles = await Article.insertMany(articlesToCreate);
        }
        res.status(201).json({ publication, articles: createdArticles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer toutes les publications
// @route   GET /api/publications
exports.getPublications = async (req, res) => {
    try {
        const publications = await Publication.find({});
        res.status(200).json(publications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Récupérer une publication par ID
// @route   GET /api/publications/:id
exports.getPublicationById = async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);
        if (!publication) {
            res.status(404).json({ message: 'Publication non trouvée' });
        } else {
            res.status(200).json(publication);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mettre à jour une publication
// @route   PUT /api/publications/:id
exports.updatePublication = async (req, res) => {
    try {
        const publication = await Publication.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!publication) {
            res.status(404).json({ message: 'Publication non trouvée' });
        } else {
            res.status(200).json(publication);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Supprimer une publication
// @route   DELETE /api/publications/:id
exports.deletePublication = async (req, res) => {
    try {
        await Publication.findByIdAndRemove(req.params.id);
        res.status(200).json({ message: 'Publication supprimée' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Récupérer les articles d'une publication
// @route   GET /api/publications/:id/articles
exports.getArticlesByPublication = async (req, res) => {
    try {
        const articles = await Article.find({ publicationId: req.params.id });
        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Aucun article trouvé pour cette publication' });
        }
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
