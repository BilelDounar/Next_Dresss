"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/atom/input';
import { Textarea } from '@/components/atom/textarea';
import Button from '@/components/atom/button';
import Image from 'next/image';

export interface Article {
    id: string;
    photo: File | null;
    title: string;
    description: string;
    price: string;
    link: string;
}

interface AddArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddArticle: (article: Omit<Article, 'id'>) => void;
}

export default function AddArticleModal({ isOpen, onClose, onAddArticle }: AddArticleModalProps) {
    const [articlePhoto, setArticlePhoto] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [link, setLink] = useState('');
    const [errors, setErrors] = useState<{ photo?: string; title?: string }>({});
    const photoInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setArticlePhoto(null);
        setTitle('');
        setDescription('');
        setPrice('');
        setLink('');
        setErrors({});
    };

    const handleAddArticle = () => {
        // Valide les champs requis
        const fieldErrors: { photo?: string; title?: string } = {};
        if (!articlePhoto) {
            fieldErrors.photo = 'Une photo d\'article est requise.';
        }
        if (!title.trim()) {
            fieldErrors.title = 'Le titre est requis.';
        }
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        onAddArticle({ photo: articlePhoto, title, description, price, link });
        resetForm();
        onClose();
    };

    const handlePhotoClick = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArticlePhoto(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    return (
        <div className={`fixed py-4 inset-0 bg-[#F5F5F1] z-50 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
            <header className="flex items-center mb-8 px-4 ">
                <button onClick={(e) => { onClose(); e.preventDefault() }} className="flex items-center font-serif text-lg">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour
                </button>
            </header>

            <div className="flex-grow overflow-y-auto px-4 ">
                <h2 className="font-serif text-2xl font-bold mb-2">Photo de l&apos;article</h2>
                <div
                    className="w-40 h-40 bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer mb-6 relative overflow-hidden"
                    onClick={handlePhotoClick}
                >
                    {articlePhoto ? (
                        <Image src={URL.createObjectURL(articlePhoto)} alt="Article photo" layout="fill" objectFit="cover" />
                    ) : (
                        <Plus className="w-8 h-8 text-stone-500" />
                    )}
                </div>
                {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                <input type="file" ref={photoInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />

                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Titre</h2>
                    <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Description</h2>
                    <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none" rows={4} />
                </div>

                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Prix</h2>
                    <Input placeholder="Prix" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Liens</h2>
                    <Input placeholder="Liens" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
            </div>

            <footer className="mt-auto pt-4 px-4">
                <Button onClick={(e) => { handleAddArticle(); e.preventDefault() }} type="button" variant="default" size="lg" iconLeft={<Plus />} className="w-full font-outfit font-semibold text-xl">
                    Ajouter
                </Button>
            </footer>
        </div>
    );
}
