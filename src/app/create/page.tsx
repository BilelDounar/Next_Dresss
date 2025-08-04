"use client";

import Button from '@/components/atom/button';
import { ChevronLeft, SendHorizontal, X, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import "@/app/scroll.css";
import { Textarea } from '@/components/atom/textarea';
import { MultiSelect } from "@/components/atom/multi-select";
import { useState, useRef } from 'react';
import AddArticleModal, { Article } from '@/components/create/AddArticleModal';
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CreatePostPage() {
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [description, setDescription] = useState('');
    const { user } = useRequireAuth();
    const [tags, setTags] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    // Gestion des messages d’erreurs par champ
    const [errors, setErrors] = useState<{ photos?: string; description?: string; tags?: string; general?: string }>({});

    const handleAddPhotoClick = () => {
        if (selectedPhotos.length < 10) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const remainingSlots = 10 - selectedPhotos.length;
            const filesToAdd = files.slice(0, remainingSlots);
            setSelectedPhotos(prevPhotos => [...prevPhotos, ...filesToAdd]);
        }
    };

    const handleRemovePhoto = (index: number) => {
        setSelectedPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    };

    const handleAddArticle = (newArticleData: Omit<Article, 'id'>) => {
        const newArticle: Article = {
            ...newArticleData,
            id: Date.now().toString(), // Simple unique ID
        };
        setArticles(prev => [...prev, newArticle]);
    };

    const handleRemoveArticle = (id: string) => {
        setArticles(prev => prev.filter(article => article.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Nettoie les erreurs précédentes
        setErrors({});

        // Vérifier si l'objet user et user.id existent
        if (!user || !user.id) {
            setErrors({ general: "Impossible de récupérer l'identifiant de l'utilisateur. Veuillez vous reconnecter." });
            return;
        }

        // Validations côté client
        const validationErrors: { photos?: string; description?: string; tags?: string } = {};
        if (selectedPhotos.length === 0) {
            validationErrors.photos = 'Une photo de publication au minimum est requise.';
        }
        if (tags.length === 0) {
            validationErrors.tags = 'Veuillez sélectionner au moins un tag.';
        }
        if (description.trim() === '') {
            validationErrors.description = 'La description est requise.';
        }
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('userId', user.id); // Utilisation directe de user.id

        // Ajouter les tags
        tags.forEach(tag => {
            formData.append('tags', tag);
        });

        // Ajouter les photos principales de la publication
        selectedPhotos.forEach((photo) => {
            formData.append('publicationPhoto', photo);
        });

        // Ajouter les données des articles et leurs photos
        // Le backend attend les champs en français : titre, prix, lien
        const articlesPayload = articles.map(({ title, description, price, link }) => ({
            titre: title,
            description,
            prix: Number(price), // convertir en nombre
            lien: link,
        }));

        formData.append('articles', JSON.stringify(articlesPayload));
        articles.forEach((article, index) => {
            // Ajoute la photo de l'article si elle existe
            if (article.photo) {
                formData.append('articlePhotos', article.photo, `article_${index}_${article.photo.name}`);
            }
        });

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
            const response = await fetch(`${apiUrl}/api/publications`, {
                method: 'POST',
                // Pas besoin d'en-têtes spécifiques, le navigateur gère le Content-Type pour FormData
                body: formData,
            });

            if (response.ok) {
                window.location.href = '/profil';
            } else {
                const responseData = await response.json();

                // Tentative d'extraction d'erreurs champ par champ
                const fieldErrors: { [key: string]: string } = {};

                if (responseData?.errors && typeof responseData.errors === 'object') {
                    // Format Mongoose « Validation failed » : errors = { description: { message: '…' }, … }
                    type FieldErr = { message?: string };
                    const entries = Object.entries(responseData.errors as Record<string, FieldErr>);
                    for (const [field, errVal] of entries) {
                        fieldErrors[field] = errVal?.message || 'Champ invalide';
                    }
                } else if (typeof responseData?.message === 'string') {
                    // Exemple : "Publication validation failed: description: Path `description` is required."
                    const msg: string = responseData.message;
                    if (/description/i.test(msg)) {
                        fieldErrors.description = 'La description est requise.';
                    }
                    if (/tags?/i.test(msg)) {
                        fieldErrors.tags = 'Veuillez sélectionner au moins un tag.';
                    }
                    if (/photos?/i.test(msg)) {
                        fieldErrors.photos = 'Une photo de publication au minimum est requise.';
                    }
                }

                if (Object.keys(fieldErrors).length > 0) {
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: responseData.message || 'Une erreur est survenue lors de la publication.' });
                }
            }
        } catch (error) {
            console.error(error);

            if ((error as Error).message) {
                // Utilise déjà la logique ci-dessus si handleFetch a défini des errors champ.
                if (Object.keys(errors).length === 0) {
                    setErrors({ general: (error as Error).message });
                }
            } else {
                setErrors({ general: 'Une erreur inconnue est survenue.' });
            }
        }
    };

    const handleMultiSelectChange = (selectedOptions: string[]) => {
        setTags(selectedOptions);
    };

    const styleOptions = [
        { value: "streetwear", label: "Streetwear" },
        { value: "casual", label: "Casual" },
        { value: "chic", label: "Chic" },
        { value: "vintage", label: "Vintage" },
        { value: "sportswear", label: "Sportswear" },
        { value: "minimalist", label: "Minimaliste" },
        { value: "street", label: "Street" },
        { value: "Autre", label: "Autre" },
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-[#F5F5F1] min-h-screen text-black font-serif p-4">
            <header className="flex items-center justify-between mb-2 mt-6">
                <Link href="/home" className="flex items-center">
                    <ChevronLeft className="w-6 h-6" />
                    <span className="ml-2 text-base font-outfit font-base">Retour</span>
                </Link>
            </header>

            {errors.general && (
                <p className="text-red-600 mb-2">{errors.general}</p>
            )}

            <div>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">Vos photos ({selectedPhotos.length}/10)</h2>
                    <div className="flex space-x-4 overflow-x-auto invisible-scrollbar">
                        {selectedPhotos.map((photo, i) => (
                            <div key={i} className="relative flex-shrink-0 z-10 w-40 h-45 bg-gray-300 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleRemovePhoto(i)}>
                                <Image
                                    src={URL.createObjectURL(photo)}
                                    alt={`Photo ${i + 1}`}
                                    layout="fill"
                                    objectFit="cover"
                                />
                                <div className="absolute inset-0 z-50 bg-red-300/40 flex justify-center items-center transition-opacity">
                                    <X className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        ))}
                        {selectedPhotos.length < 10 && (
                            <div id="add-photo" className="flex-shrink-0 w-40 h-45 bg-gray-300 rounded-lg overflow-hidden cursor-pointer" onClick={handleAddPhotoClick}>
                                <div className="w-full h-full flex justify-center items-center">
                                    <Plus className="w-6 h-6 text-stone-500 cursor-pointer" />
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.photos && <p className="text-red-600 text-sm mt-1">{errors.photos}</p>}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                        multiple
                    />
                </div>

                <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">Description</h2>
                    <Textarea
                        placeholder="Description"
                        className="resize-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">Tags</h2>
                    <MultiSelect
                        options={styleOptions}
                        selected={tags}
                        onChange={handleMultiSelectChange}
                        placeholder="Sélectionnez vos styles"
                        className="w-full"
                    />
                    {errors.tags && <p className="text-red-600 text-sm mt-1">{errors.tags}</p>}
                </div>

                <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">Articles</h2>
                    <div className="flex space-x-4 overflow-x-auto invisible-scrollbar">
                        {articles.map((article) => (
                            <div key={article.id} className="relative flex-shrink-0 w-40 h-30 bg-gray-300 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleRemoveArticle(article.id)}>
                                {article.photo && (
                                    <Image
                                        src={URL.createObjectURL(article.photo)}
                                        alt={article.title}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
                                    <X className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                                    <p className="text-white text-xs truncate">{article.title}</p>
                                </div>
                            </div>
                        ))}
                        <div id="add-article" className="flex-shrink-0 w-40 h-30 bg-gray-300 rounded-lg overflow-hidden cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            <div className="w-full h-full flex justify-center items-center">
                                <Plus className="w-6 h-6 text-stone-500 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
                <Button type="submit" variant="default" size="lg" iconRight={<SendHorizontal strokeWidth={2.5} />} className=' mt-2 font-outfit font-semibold text-xl'>
                    Publier
                </Button>
            </div>
            <AddArticleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddArticle={handleAddArticle} />
        </form>
    );
}
