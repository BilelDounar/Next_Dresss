"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Slide from "@/components/navigation/Slide";
import CardItem from "@/components/home/CardItem";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Transition, TransitionChild } from "@headlessui/react";
import { useRouter } from "next/navigation";

interface Save {
    _id: string;
    itemId: string;
    itemType: "publication" | "article";
}

interface Publication {
    _id: string;
    description: string;
    urlsPhotos?: string[];
    user: string;
    likes?: number;
    saved?: number;
    comments?: number;
}

interface Article {
    _id: string;
    titre: string;
    description: string;
    prix: number;
    urlPhoto: string;
    lien?: string;
}

export default function SavesPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const router = useRouter();

    const [savedPublications, setSavedPublications] = useState<Publication[]>([]);
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    /* Viewer modal state (publications) */
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const fetchSaves = async () => {
            setLoadingData(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const res = await fetch(`${apiUrl}/api/saves/user/${user.id}`);
                if (!res.ok) throw new Error("Erreur lors de la récupération des sauvegardes");
                const saves: Save[] = await res.json();

                const publicationIds = saves
                    .filter((s) => s.itemType === "publication")
                    .map((s) => s.itemId);
                const articleIds = saves
                    .filter((s) => s.itemType === "article")
                    .map((s) => s.itemId);

                const pubPromises = publicationIds.map((id) =>
                    fetch(`${apiUrl}/api/publications/${id}`).then((r) => (r.ok ? r.json() : null))
                );
                const artPromises = articleIds.map((id) =>
                    fetch(`${apiUrl}/api/articles/${id}`).then((r) => (r.ok ? r.json() : null))
                );

                const [pubData, artData] = await Promise.all([
                    Promise.all(pubPromises),
                    Promise.all(artPromises),
                ]);

                setSavedPublications(pubData.filter(Boolean));
                setSavedArticles(artData.filter(Boolean));
            } catch (err) {
                console.error("fetchSaves error", err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchSaves();
    }, [user]);

    /* IntersectionObserver to track active slide */
    useEffect(() => {
        if (viewerIndex === null) return;
        const currentRefs = slideRefs.current;
        if (savedPublications.length === 0 || !window.IntersectionObserver) return;

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

        currentRefs.forEach((ref) => {
            if (ref) observer.current?.observe(ref);
        });

        return () => {
            currentRefs.forEach((ref) => {
                if (ref && observer.current) observer.current.unobserve(ref);
            });
        };
    }, [viewerIndex, savedPublications]);

    useEffect(() => {
        if (viewerIndex !== null && slideRefs.current[viewerIndex]) {
            slideRefs.current[viewerIndex]?.scrollIntoView({ block: "start" });
        }
    }, [viewerIndex]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen">Chargement...</div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">Veuillez vous connecter</div>
        );
    }

    return (
        <div className="bg-[#F8F5F2] min-h-screen font-serif text-[#333]">
            <div className="flex items-center justify-between mx-2 py-6 ">
                <button onClick={() => router.back()} className="flex items-center">
                    <ChevronLeft className="w-6 h-6" />
                    <span className="ml-2 text-base font-outfit font-base">Retour</span>
                </button>
            </div>
            <div className="max-w-md mx-auto p-4 pt--">
                <h1 className="text-2xl font-bold mb-6">Sauvegardes</h1>

                {/* Section Publications */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 px-4">Looks</h2>
                    {loadingData ? (
                        <div className="grid grid-cols-2 gap-3 px-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <Skeleton key={idx} className="w-full h-60 rounded-2xl bg-primary-300" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 px-2">
                            {savedPublications.length === 0 ? (
                                <div className="text-center py-4 col-span-2">Aucun look sauvegardé.</div>
                            ) : (
                                savedPublications.map((pub, index) =>
                                    pub.urlsPhotos && pub.urlsPhotos.length > 0 ? (
                                        <div
                                            key={pub._id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setViewerIndex(index)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") setViewerIndex(index);
                                            }}
                                            className="relative w-full h-60 rounded-2xl overflow-hidden bg-primary-300 cursor-pointer"
                                        >
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_MONGO}${pub.urlsPhotos[0]}`}
                                                alt={`Look ${pub.description || ""}`}
                                                fill
                                                sizes="(max-width: 450px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : null
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Section Articles */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 px-4">Articles</h2>
                    {loadingData ? (
                        <div className="grid grid-cols-2 gap-3 px-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <Skeleton key={idx} className="w-full h-60 rounded-2xl bg-primary-300" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-y-4 px-2">
                            {savedArticles.length === 0 ? (
                                <div className="text-center py-4">Aucun article sauvegardé.</div>
                            ) : (
                                savedArticles.map((art) => (
                                    <CardItem
                                        key={art._id}
                                        articleId={art._id}
                                        title={art.titre}
                                        description={art.description}
                                        price={art.prix}
                                        urlPhoto={art.urlPhoto}
                                        openLink={art.lien}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Viewer Modal */}
            {viewerIndex !== null && (
                <Transition show={viewerIndex !== null} as={Fragment}>
                    <div className="fixed inset-0 z-50 flex justify-center items-start p-5 pt-12">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div
                                className="absolute inset-0 bg-black/40"
                                onClick={() => setViewerIndex(null)}
                            />
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
                                <button
                                    onClick={() => setViewerIndex(null)}
                                    className="absolute top-4 left-4 z-10"
                                >
                                    <ChevronLeft className="w-6 h-6 text-black" />
                                </button>
                                <div
                                    ref={containerRef}
                                    className="snap-y snap-mandatory overflow-y-scroll h-full invisible-scrollbar"
                                >
                                    {savedPublications.map((pub, index) => {
                                        const isVisible = Math.abs(index - activeIndex) <= 1;
                                        return (
                                            <div
                                                key={pub._id}
                                                ref={(el) => {
                                                    slideRefs.current[index] = el;
                                                }}
                                                data-index={index}
                                                className="snap-start w-full h-full"
                                            >
                                                {isVisible ? (
                                                    <Slide publication={pub} />
                                                ) : (
                                                    <div className="w-full h-full" />
                                                )}
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
    );
}
