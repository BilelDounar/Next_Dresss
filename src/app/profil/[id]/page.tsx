"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/atom/avatar";
import Button from "@/components/atom/button";
import { ChevronLeft, Plus, Minus, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Slide from "@/components/navigation/Slide";
import "@/app/scroll.css";
import { Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFollow } from "@/hooks/useFollow";

interface Publication {
    _id: string;
    description: string;
    urlsPhotos?: string[];
    user: string;
}

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
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string | undefined;

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPublications, setLoadingPublications] = useState(true);

    // auth & follow
    const { user } = useRequireAuth();
    // Si l'utilisateur ouvre son propre profil via l'URL /profil/[id],
    // on le redirige vers la page dédiée /profil pour éviter le bouton follow.
    useEffect(() => {
        if (user?.id && id === String(user.id)) {
            router.replace('/profil');
        }
    }, [id, user?.id, router]);
    const { isFollowing, follow, unfollow, loading: followLoading } = useFollow(user?.id, id);

    // viewer states
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) return;
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`/api/users?id=${id}`);
                if (!response.ok) throw new Error("Erreur lors de la récupération du profil utilisateur");
                const data: UserProfile = await response.json();
                setUserProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchUserProfile();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const fetchPublications = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const response = await fetch(`${apiUrl}/api/publications/user/${id}`);
                if (!response.ok) throw new Error("Erreur lors de la récupération des publications");
                const data: Publication[] = await response.json();
                setPublications(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setPublications([]);
            } finally {
                setLoadingPublications(false);
            }
        };
        fetchPublications();
    }, [id]);

    // IntersectionObserver for viewer mode
    useEffect(() => {
        if (viewerIndex === null) return; // only when in viewer mode
        const currentSlideRefs = slideRefs.current;

        if (publications.length === 0 || !window.IntersectionObserver) return;

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = parseInt(entry.target.getAttribute("data-index") || "0", 10);
                        setActiveIndex(idx);
                    }
                });
            },
            { threshold: 0.6 }
        );

        Object.values(currentSlideRefs).forEach((ref) => {
            if (ref) observer.current?.observe(ref);
        });

        return () => {
            Object.values(currentSlideRefs).forEach((ref) => {
                if (ref && observer.current) observer.current.unobserve(ref);
            });
        };
    }, [viewerIndex, publications]);

    // scroll to initial viewerIndex when viewer opens
    useEffect(() => {
        if (viewerIndex !== null && slideRefs.current[viewerIndex]) {
            slideRefs.current[viewerIndex]?.scrollIntoView({ block: "start" });
        }
    }, [viewerIndex]);

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    if (!id) return <div className="flex items-center justify-center h-screen">Profil introuvable.</div>;

    return (
        <div className="bg-[#F8F5F2] min-h-screen font-serif text-[#333]">
            <div className="max-w-md mx-auto p-4 pt-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-2 ">
                    <button onClick={() => router.back()} className="flex items-center">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="ml-2 text-base font-outfit font-base">Retour</span>
                    </button>
                </header>

                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                    {loadingProfile ? (
                        <Skeleton className="w-24 h-24 rounded-full mb-4 bg-primary-300" />
                    ) : (
                        userProfile ? (
                            userProfile.profile_picture_url ? (
                                <Avatar
                                    src={userProfile.profile_picture_url}
                                    alt={userProfile.pseudo ? getInitials(userProfile.pseudo) : '?'}
                                    size="lg"
                                    isFollowed={true}
                                />
                            ) : (
                                <Avatar src="" alt={userProfile.pseudo ? getInitials(userProfile.pseudo) : '?'} size="lg" isFollowed={true} />
                            )
                        ) : (
                            <Avatar src="" alt="?" size="lg" isFollowed={true} />
                        )
                    )}

                    {/* Name & pseudo */}
                    {loadingProfile ? (
                        <>
                            <Skeleton className="h-6 w-40 bg-primary-300 rounded mb-1" />
                            <Skeleton className="h-5 w-24 bg-primary-300 rounded-full mb-4" />
                        </>
                    ) : (
                        userProfile ? (
                            <>
                                <h1 className="text-2xl font-bold">
                                    {(userProfile.prenom?.trim() || userProfile.nom?.trim())
                                        ? `${userProfile.prenom?.trim() ?? ''} ${userProfile.nom?.trim() ?? ''}`.trim()
                                        : 'Utilisateur introuvable'}
                                </h1>
                                {userProfile.pseudo && (
                                    <p className="text-gray-500 mb-4 font-outfit">@{userProfile.pseudo}</p>
                                )}
                            </>
                        ) : (
                            <h1 className="text-2xl font-bold">Utilisateur introuvable</h1>
                        )
                    )}

                    {/* Stats */}
                    <div className="flex space-x-8 mb-2">
                        <div className="text-center">
                            <div className="font-bold text-lg font-montserrat">
                                {loadingProfile ? <Skeleton className="bg-primary-300 h-5 w-10 rounded" /> : (userProfile ? userProfile.followers_count : 0)}
                            </div>
                            <p className="text-sm text-gray-600">Followers</p>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg font-montserrat">
                                {loadingProfile ? <Skeleton className="bg-primary-300 h-5 w-10 rounded" /> : (userProfile ? publications.length : 0)}
                            </div>
                            <p className="text-sm text-gray-600">Looks</p>
                        </div>
                    </div>
                    <hr className=" border w-1/3" />
                    {/* Bio */}
                    <div className="flex mb-2 w-full mt-2">
                        <div className="w-full flex items-center justify-center">
                            {loadingProfile ? <Skeleton className="bg-primary-300 h-5 w-20 rounded" /> : <p className="w-fulltext-sm text-gray-600"> {userProfile?.bio}</p>}
                        </div>
                    </div>
                    {/* Bouton */}
                    <div className="flex flex-row w-full gap-x-3">
                        <div className="w-full">
                            <Button
                                onClick={async () => {
                                    if (!user) return; // optionnel : rediriger vers login
                                    const delta = isFollowing ? -1 : 1;
                                    if (isFollowing) {
                                        await unfollow();
                                    } else {
                                        await follow();
                                    }

                                    /* Mise à jour PG */
                                    try {
                                        await fetch('/api/users/followers', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId: id, delta })
                                        });
                                    } catch (err) {
                                        console.error('Erreur MAJ followers_count PG', err);
                                    }

                                    // MAJ état local
                                    setUserProfile((prev) => {
                                        if (!prev) return prev;
                                        const newCount = Math.max((prev.followers_count || 0) + delta, 0);
                                        return { ...prev, followers_count: newCount };
                                    });
                                }}
                                variant={isFollowing ? "secondary" : "default"}
                                className="font-outfit"
                                disabled={followLoading}
                                iconLeft={followLoading ? undefined : (isFollowing ? <Minus /> : <Plus />)}
                            >
                                {followLoading ? "..." : isFollowing ? "Suivi" : "Suivre"}
                            </Button>
                        </div>
                        <div className="w-full">
                            <Button onClick={() => console.log('Share clicked!')} variant="secondary" className="font-outfit" iconLeft={<Share2 />}>Partager</Button>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4 px-4">Looks</h2>
                    {loadingPublications ? (
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
                                        <button key={pub._id} onClick={() => setViewerIndex(index)} className="relative w-full h-60 rounded-2xl overflow-hidden bg-primary-300">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_MONGO}${pub.urlsPhotos[0]}`}
                                                alt={`Look ${pub.description || ""}`}
                                                fill
                                                sizes="(max-width: 450px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                        </button>
                                    )
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Viewer Modal */}
                {viewerIndex !== null && (
                    <Transition show={viewerIndex !== null} as={Fragment}>
                        <div className="fixed inset-0 z-50 flex justify-end p-5 pt-12">
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
            </div>
        </div>
    );
}
