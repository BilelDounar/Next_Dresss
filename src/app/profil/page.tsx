"use client";

import { useEffect, useState, useRef, Fragment } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
// import CardItem from '../Components/home/CardItem';
import Button from "@/components/atom/button";
import Avatar from "@/components/atom/avatar";
import { Edit, ChevronLeft, Trash, EllipsisVertical, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import Slide from '@/components/navigation/Slide';
import { Transition, TransitionChild } from '@headlessui/react';
import EditProfileModal from '@/components/profil/EditProfileModal';
import SettingsModal from '@/components/profil/SettingsModal';
import Link from 'next/link';

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
    const { user, loading: authLoading, logout } = useRequireAuth();
    const [publications, setPublications] = useState<Publication[]>([]);
    const [publicationsLoading, setPublicationsLoading] = useState(true);

    // viewer states
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

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

    // IntersectionObserver for viewer mode
    useEffect(() => {
        if (viewerIndex === null) return;
        const currentSlideRefs = slideRefs.current;
        if (publications.length === 0 || !window.IntersectionObserver) return;

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                    setActiveIndex(idx);
                }
            });
        }, { threshold: 0.6 });

        Object.values(currentSlideRefs).forEach((ref) => {
            if (ref) observer.current?.observe(ref);
        });

        return () => {
            Object.values(currentSlideRefs).forEach((ref) => {
                if (ref && observer.current) observer.current.unobserve(ref);
            });
        };
    }, [viewerIndex, publications]);

    // Scroll to selected on open
    useEffect(() => {
        if (viewerIndex !== null && slideRefs.current[viewerIndex]) {
            slideRefs.current[viewerIndex]?.scrollIntoView({ block: 'start' });
        }
    }, [viewerIndex]);

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // État pour le profil complet

    // delete confirmation
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Delete publication handler
    const confirmDelete = async () => {
        if (deleteIndex === null) return;
        const pub = publications[deleteIndex];
        try {
            setDeleting(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
            const res = await fetch(`${apiUrl}/api/publications/${pub._id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Erreur suppression');
            setPublications((prev) => prev.filter((_, idx) => idx !== deleteIndex));
            setDeleteIndex(null);
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(false);
        }
    };

    // Modal d'édition du profil
    const [isEditOpen, setIsEditOpen] = useState(false);
    // Settings modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Sauvegarde des modifications du profil (callback pour la modal)
    const handleProfileSave = async ({ photo, pseudo, bio, nom, prenom }: { photo: File | null; pseudo: string; bio: string; nom: string; prenom: string }) => {
        try {
            const formData = new FormData();
            formData.append('pseudo', pseudo);
            formData.append('bio', bio);
            formData.append('nom', nom);
            formData.append('prenom', prenom);
            if (photo) formData.append('photo', photo);

            const res = await fetch(`/api/users?id=${user?.id}`, {
                method: 'PUT',
                body: formData,
            });
            if (!res.ok) throw new Error('Erreur lors de la mise à jour du profil');

            const updated: UserProfile = await res.json();
            setUserProfile(updated);
        } catch (err) {
            console.error(err);
        }
    };

    // Callback: change password
    const handlePasswordChange = async (oldPw: string, newPw: string) => {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
        });
        if (!res.ok) throw new Error('Erreur changement mot de passe');
    };

    // Callback: delete account
    const handleDeleteAccount = async () => {
        const res = await fetch(`/api/users?id=${user?.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erreur suppression compte');
        await handleLogout();
    };

    // Handler to open settings / parameters modal or page
    const handleModalParameter = () => {
        setIsSettingsOpen(true);
    };

    const handleLogout = async () => {
        try {
            // Inform backend (optional) but we rely on client cleanup for safety
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch { /* ignore network errors */ }

        // Clean client-side session (localStorage + React state)
        logout();

        // Redirige vers la page d’accueil publique
        router.push('/welcome');
    };

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
            <div className="max-w-md mx-auto p-4 pt-12 relative">

                {/* Lien vers les éléments sauvegardés */}
                <Link href="/saves" aria-label="Sauvegardes" className="absolute top-4 left-4 flex items-center p-2">
                    <Bookmark size={24} />
                </Link>

                <button onClick={handleModalParameter} aria-label="Paramètres" className="absolute top-4 right-4 flex items-center p-2">
                    <EllipsisVertical size={24} />
                </button>
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    {userProfile ? (
                        <Avatar
                            src={
                                userProfile.profile_picture_url
                                    ? (
                                        userProfile.profile_picture_url.startsWith('https')
                                            ? userProfile.profile_picture_url
                                            : `${process.env.NEXT_PUBLIC_IMAGE_BASE}${userProfile.profile_picture_url.replace(/^\/uploads/, '')}`
                                    )
                                    : undefined
                            }
                            alt={getInitials(userProfile.pseudo)}
                            size="lg"
                            isFollowed
                        />

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
                        <Button onClick={() => setIsEditOpen(true)} variant="default" className="font-outfit" iconLeft={<Edit />}>Modifier</Button>
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
                                publications.map((pub, index) => (
                                    pub.urlsPhotos && pub.urlsPhotos.length > 0 && (
                                        <div
                                            key={pub._id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setViewerIndex(index)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setViewerIndex(index); } }}
                                            className="relative w-full h-60 rounded-2xl overflow-hidden bg-primary-300 cursor-pointer"
                                        >
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_MONGO}${pub.urlsPhotos[0]}`}
                                                alt={`Look ${pub.description || ''}`}
                                                fill
                                                sizes="(max-width: 450px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                            {/* trash icon */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteIndex(index); }}
                                                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full"
                                            >
                                                <Trash className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {viewerIndex !== null && (
                <Transition show={viewerIndex !== null} as={Fragment}>
                    <div className="fixed inset-0 z-50 flex justify-center items-center p-5 pt-0">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="absolute inset-0 bg-black/40" onClick={() => setViewerIndex(null)} />
                        </TransitionChild>
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="ease-in duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <div className="relative w-full max-w-[450px] h-[80vh] bg-primary-300">
                                <button onClick={() => setViewerIndex(null)} className="absolute top-4 left-4 z-10">
                                    <ChevronLeft className="w-6 h-6 text-black" />
                                </button>
                                <div ref={containerRef} className="snap-y snap-mandatory overflow-y-scroll h-full invisible-scrollbar">
                                    {publications.map((pub, index) => {
                                        const isVisible = Math.abs(index - activeIndex) <= 1;
                                        return (
                                            <div
                                                key={pub._id}
                                                ref={(el) => { slideRefs.current[index] = el; }}
                                                data-index={index}
                                                className="snap-start w-full h-full"
                                            >
                                                {isVisible ? <Slide publication={pub} /> : <div className="w-full h-full" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </Transition>
            )}

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleProfileSave}
                initialPseudo={userProfile?.pseudo || ''}
                initialBio={userProfile?.bio || ''}
                initialNom={userProfile?.nom || ''}
                initialPrenom={userProfile?.prenom || ''}
                initialPhotoUrl={userProfile?.profile_picture_url ?? ''}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onPasswordChange={handlePasswordChange}
                onDeleteAccount={handleDeleteAccount}
                onLogout={handleLogout}
            />

            {deleteIndex !== null && (
                <Transition show={deleteIndex !== null} as={Fragment}>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteIndex(null)} />
                        </TransitionChild>
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="scale-95 opacity-0"
                            enterTo="scale-100 opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="scale-100 opacity-100"
                            leaveTo="scale-95 opacity-0"
                        >
                            <div className="relative bg-white rounded-lg p-6 w-80 max-w-full">
                                <h3 className="text-lg font-semibold mb-4">Supprimer ce look ?</h3>
                                <p className="text-sm text-gray-600 mb-6">Cette action est irréversible.</p>
                                <div className="flex justify-end space-x-3">
                                    <Button variant="ghost" onClick={() => setDeleteIndex(null)}>Annuler</Button>
                                    <Button className='text-white' variant="destructive" disabled={deleting} onClick={confirmDelete}>
                                        {deleting ? 'Suppression...' : 'Supprimer'}
                                    </Button>
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </Transition>
            )}
        </div>
    );
}
