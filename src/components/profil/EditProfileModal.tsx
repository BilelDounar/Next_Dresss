"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import Avatar from '@/components/atom/avatar';
import Button from '@/components/atom/button';
import { Input } from '@/components/atom/input';
import { Textarea } from '@/components/atom/textarea';
import Image from 'next/image';
import Link from 'next/link';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: { photo: File | null; pseudo: string; bio: string; nom: string; prenom: string }) => void;
    initialPseudo: string;
    initialBio: string | null;
    initialNom: string;
    initialPrenom: string;
    initialPhotoUrl?: string;
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialPseudo, initialBio, initialNom, initialPrenom, initialPhotoUrl }: EditProfileModalProps) {
    const [photo, setPhoto] = useState<File | null>(null);
    const [pseudo, setPseudo] = useState(initialPseudo);
    const [bio, setBio] = useState(initialBio || '');
    const [nom, setNom] = useState(initialNom);
    const [prenom, setPrenom] = useState(initialPrenom);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<{ photo?: string; pseudo?: string; nom?: string; prenom?: string }>({});

    // Synchronise les champs internes avec les props chaque fois que la modal s'ouvre
    const syncFields = () => {
        setPhoto(null);
        setPseudo(initialPseudo);
        setBio(initialBio || '');
        setNom(initialNom);
        setPrenom(initialPrenom);
        setErrors({});
    };

    // Réinitialise les champs quand on ouvre ou ferme la modal, ou quand les valeurs initiales changent
    useEffect(() => {
        if (isOpen) {
            // Ouverture : on préremplit
            syncFields();
        }
        // Fermeture : on nettoie pour une prochaine ouverture
        if (!isOpen) {
            syncFields();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialPseudo, initialBio, initialNom, initialPrenom]);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSave = () => {
        const fieldErrors: { photo?: string; pseudo?: string; nom?: string; prenom?: string } = {};
        if (!pseudo.trim()) {
            fieldErrors.pseudo = 'Le pseudo est requis.';
        }
        if (!nom.trim()) {
            fieldErrors.nom = 'Le nom est requis.';
        }
        if (!prenom.trim()) {
            fieldErrors.prenom = 'Le prénom est requis.';
        }
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        onSave({ photo, pseudo, bio, nom, prenom });
        onClose();
    };

    return (
        <div className={`fixed inset-0 bg-[#F5F5F1] z-50 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
            {/* Header */}
            <header className="flex items-center my-8 px-4 ">
                <button onClick={(e) => { onClose(); e.preventDefault(); }} className="flex items-center font-serif text-lg">
                    <Link href="/profil" className="flex items-center font-serif text-lg">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour
                    </Link>
                </button>
            </header>

            {/* Body */}
            <div className="flex-grow overflow-y-auto px-4">
                {/* Photo */}
                <h2 className="font-serif text-2xl font-bold mb-2">Photo de profil</h2>
                <div
                    className="w-32 h-32 mx-auto bg-gray-300 rounded-full flex items-center justify-center cursor-pointer mb-6 relative overflow-hidden"
                    onClick={handlePhotoClick}
                >
                    {photo ? (
                        <Image src={URL.createObjectURL(photo)} alt="Profil" layout="fill" objectFit="cover" />
                    ) : initialPhotoUrl ? (
                        <Image src={initialPhotoUrl} alt="Profil" layout="fill" objectFit="cover" />
                    ) : (
                        <Avatar alt={pseudo.charAt(0)} size="lg" />
                    )}
                </div>
                {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />

                {/* Nom */}
                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Nom</h2>
                    <Input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                    {errors.nom && <p className="text-red-600 text-sm mt-1">{errors.nom}</p>}
                </div>

                {/* Prénom */}
                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Prénom</h2>
                    <Input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                    {errors.prenom && <p className="text-red-600 text-sm mt-1">{errors.prenom}</p>}
                </div>

                {/* Pseudo */}
                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Pseudo</h2>
                    <Input placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
                    {errors.pseudo && <p className="text-red-600 text-sm mt-1">{errors.pseudo}</p>}
                </div>

                {/* Bio */}
                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold mb-2">Bio</h2>
                    <Textarea placeholder="Votre bio" value={bio} onChange={(e) => setBio(e.target.value)} className="resize-none" rows={4} />
                </div>
                {/* Footer */}
                <div className="mt-auto pt-4">
                    <Button onClick={(e) => { handleSave(); e.preventDefault(); }} type="button" variant="default" size="lg" iconLeft={<Check />} className="w-full font-outfit font-semibold text-xl">
                        Enregistrer
                    </Button>
                </div>
            </div>


        </div>
    );
}
