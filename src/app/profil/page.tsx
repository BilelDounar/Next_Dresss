"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import CardItem from '../Components/home/CardItem';
import Button from "@/components/atom/button";

// Type pour une publication, correspondant à l'API
interface Publication {
    _id: string;
    description: string;
    urlsPhotos: string[];
    user: string;
}

// Interface pour le profil utilisateur complet depuis la base de données
interface UserProfile {
    followersCount: number;
    followingCount: number;
    // Ajoutez d'autres champs si nécessaire (bio, etc.)
}

export default function ProfilPage() {
    const { user, loading: authLoading } = useAuth();
    const [publications, setPublications] = useState<Publication[]>([]);
    const [publicationsLoading, setPublicationsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // État pour le profil complet

    useEffect(() => {
        const fetchUserPublications = async () => {
            if (!user) return;

            setPublicationsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const response = await fetch(`${apiUrl}/api/publications?userId=${user.id}`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des publications");
                }
                const data: Publication[] = await response.json();
                setPublications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Impossible de charger les publications:", error);
                setPublications([]);
            } finally {
                setPublicationsLoading(false);
            }
        };

        if (user) {
            fetchUserPublications();
        }
    }, [user]);

    // Effet pour récupérer les données complètes de l'utilisateur
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                // Appel à notre API Next.js pour les données de l'utilisateur
                const response = await fetch(`/api/users?id=${user.id}`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération du profil utilisateur");
                }
                const data: UserProfile = await response.json();
                setUserProfile(data);
            } catch (error) {
                console.error("Impossible de charger le profil utilisateur:", error);
            }
        };

        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Chargement du profil...</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen">Veuillez vous connecter pour voir votre profil.</div>;
    }

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    console.log(userProfile);

    return (
        <div className="bg-[#F8F5F2] min-h-screen font-serif text-[#333]">
            <div className="max-w-md mx-auto p-4 pt-12">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-gray-500">
                            {userProfile?.pseudo ? getInitials(userProfile.pseudo) : 'U'}
                        </span>
                    </div>

                    {/* Nom et @ */}
                    <h1 className="text-2xl font-bold">{userProfile?.prenom + ' ' + userProfile?.nom || 'Utilisateur'}</h1>
                    <p className="text-gray-500 mb-4">@{userProfile?.pseudo || 'username'}</p>

                    {/* Stats */}
                    <div className="flex space-x-8 mb-6">
                        <div className="text-center">
                            <p className="font-bold text-lg">{userProfile ? userProfile.followersCount : '...'}</p>
                            <p className="text-sm text-gray-600">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg">{publications.length}</p>
                            <p className="text-sm text-gray-600">Looks</p>
                        </div>
                    </div>

                    {/* Bouton Modifier */}
                    <div className="w-full px-4">
                        <Button onClick={() => console.log('Edit clicked!')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                            </svg>
                            Modifier
                        </Button>
                    </div>
                </div>

                {/* Galerie de Looks */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4 px-4">Looks</h2>
                    {publicationsLoading ? (
                        <div className="text-center py-4">Chargement des looks...</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {publications.map(pub => (
                                pub.urlsPhotos && pub.urlsPhotos.length > 0 && (
                                    <CardItem key={pub._id} imageUrl={pub.urlsPhotos[0]} />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
