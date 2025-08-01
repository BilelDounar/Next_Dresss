"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
// import CardItem from '../Components/home/CardItem';
import Button from "@/components/atom/button";
import Avatar from "@/components/atom/avatar";
import { Edit, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

// Type pour une publication, correspondant à l'API
interface Publication {
    _id: string;
    description: string;
    urlsPhotos: string[];
    user: string;
}

// Interface pour le profil utilisateur complet depuis la base de données
interface UserProfile {
    id: number;
    nom: string;
    prenom: string;
    pseudo: string;
    bio: string | null;
    profile_picture_url: string;
    followers_count: number;
}

export default function ProfilPage() {
    const { user, loading: authLoading } = useAuth();
    const [publications, setPublications] = useState<Publication[]>([]);
    const [publicationsLoading, setPublicationsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // État pour le profil complet

    // Déclare le router avant tout return conditionnel pour respecter les règles des Hooks
    const router = useRouter();

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

    // Récupération des publications de l’utilisateur
    useEffect(() => {
        if (!user) return;

        const fetchUserPublications = async () => {
            setPublicationsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                // On utilise une nouvelle route qui renvoie toutes les publications de l'utilisateur, même celles déjà vues
                const response = await fetch(`${apiUrl}/api/publications/user/${user.id}`);
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des publications');
                }
                const data: Publication[] = await response.json();
                setPublications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Impossible de charger les publications:', error);
                setPublications([]);
            } finally {
                setPublicationsLoading(false);
            }
        };

        fetchUserPublications();
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
    console.log(publications);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/welcome');
        // router.refresh(); // Assure la mise à jour de l'état côté client
    };

    return (
        <div className="bg-[#F8F5F2] min-h-screen font-serif text-[#333]">
            <div className="max-w-md mx-auto p-4 pt-12">
                <button onClick={handleLogout} aria-label="Déconnexion" className="fixed top-4 right-4 flex items-center p-2">
                    <LogOut size={28} />
                </button>
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    {userProfile ? (

                        <Avatar src={process.env.NEXT_PUBLIC_API_MONGO + userProfile.profile_picture_url} alt={getInitials(userProfile.pseudo)} size="lg" isFollowed={true} />

                    ) : (
                        <Skeleton className="w-24 h-24 rounded-full mb-4 bg-primary-300" />
                    )}

                    {/* Nom et @ */}
                    {userProfile ? (
                        <>
                            <h1 className="text-2xl font-bold">{`${userProfile.prenom} ${userProfile.nom}`}</h1>
                            <p className="text-gray-500 mb-4 font-outfit">@{userProfile.pseudo}</p>
                        </>
                    ) : (
                        <>
                            <Skeleton className="h-6 w-40 bg-primary-300 rounded mb-1" />
                            <Skeleton className="h-5 w-24 bg-primary-300 rounded-full mb-4" />
                        </>
                    )}

                    {/* Stats */}
                    <div className="flex space-x-8 mb-2">
                        <div className="text-center">
                            <div className="font-bold text-lg font-montserrat">{userProfile ? userProfile.followers_count : <Skeleton className="bg-primary-300 h-5 w-10 rounded" />}</div>
                            <p className="text-sm text-gray-600">Followers</p>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg font-montserrat">
                                {userProfile ? publications.length : <Skeleton className="bg-primary-300 h-5 w-10 rounded" />}
                            </div>
                            <p className="text-sm text-gray-600">Looks</p>
                        </div>
                    </div>
                    <hr className=" border w-1/3" />

                    {/* Bio */}
                    <div className="flex mb-2 w-full mt-2">
                        <div className="w-full text-center">
                            <p className="w-fulltext-sm text-gray-600">{userProfile?.bio}</p>
                        </div>
                    </div>

                    {/* Bouton Modifier */}
                    <div className="w-full px-4">
                        <Button onClick={() => console.log('Edit clicked!')} variant="default" className="font-outfit" iconLeft={<Edit />}>Modifier</Button>
                    </div>
                </div>

                {/* Galerie de Looks */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4 px-4">Looks</h2>
                    {publicationsLoading ? (
                        <div className="grid grid-cols-2 gap-3 px-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <Skeleton key={idx} className="w-full h-60 rounded-2xl bg-primary-300" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 px-2">
                            {publications.length === 0 ? (
                                <div className="text-center py-4 col-span-2">Aucun look trouvé.</div>
                            ) : (
                                publications.map((pub) => (
                                    pub.urlsPhotos && pub.urlsPhotos.length > 0 && (
                                        <div
                                            key={pub._id}
                                            className="relative w-full h-60 rounded-2xl overflow-hidden bg-primary-300"
                                        >
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_MONGO}${pub.urlsPhotos[0]}`}
                                                alt={`Look ${pub.description || ''}`}
                                                fill
                                                sizes="(max-width: 450px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
