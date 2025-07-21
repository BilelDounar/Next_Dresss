"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Slide from "@/app/Components/navigation/Slide";
import { useAuth } from "@/hooks/useAuth";
import "@/app/scroll.css";

// Type pour une publication, correspondant à l'API
type Publication = {
    _id: string;
    description: string;
    urlsPhotos: string[];
    user: string;
};

export default function HomePage() {
    const { user, loading: authLoading, error: authError } = useAuth();
    const router = useRouter();
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const observer = useRef<IntersectionObserver | null>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // Redirection si l'utilisateur a le statut 'pending'
        if (!authLoading && user && user.status === 'pending') {
            router.push('/about-you');
        }
        if (authError) {
            router.push('/welcome');
        }
    }, [user, authLoading, authError, router]);

    useEffect(() => {
        const fetchPublications = async () => {
            if (!user) {
                return;
            }
            if (user.status === 'pending') return;

            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const response = await fetch(`${apiUrl}/api/publications?userId=${user.id}`);
                if (!response.ok) {
                    throw new Error('La réponse du réseau n\'était pas bonne');
                }
                const data: Publication[] = await response.json();
                setPublications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Échec de la récupération des publications:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && !authLoading && !authError) {
            fetchPublications();
        }
    }, [user, authLoading, authError]);

    useEffect(() => {
        const currentSlideRefs = slideRefs.current;

        if (publications.length === 0 || !window.IntersectionObserver) return;

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
                        setActiveIndex(index);
                    }
                });
            },
            { threshold: 0.6 } // Un slide est actif si 60% est visible
        );

        Object.values(currentSlideRefs).forEach((ref) => {
            if (ref) observer.current?.observe(ref);
        });

        return () => {
            Object.values(currentSlideRefs).forEach((ref) => {
                if (ref && observer.current) observer.current.unobserve(ref);
            });
        };
    }, [publications]);

    // Affiche un état de chargement si l'authentification est en cours ou si l'utilisateur va être redirigé
    if (authLoading || (user && user.status === 'pending')) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row">
            <div className="snap-y snap-mandatory overflow-y-scroll h-[92vh] w-full bg-primary-300 invisible-scrollbar">
                {loading ? (
                    <div className="snap-start h-[92vh] flex items-center justify-center">
                        <p className="fixed top-[40%] right-[40%] text-white">Chargement...</p>
                    </div>
                ) : (
                    publications.length > 0 ? (
                        publications.map((publication, index) => {
                            // Affiche le slide s'il est actif, ou celui d'avant/après
                            const isVisible = Math.abs(index - activeIndex) <= 1;

                            return (
                                <div
                                    key={publication._id}
                                    ref={(el) => { slideRefs.current[index] = el; }}
                                    data-index={index}
                                    className="snap-start w-full h-[92vh]" // Conteneur pour l'observer
                                >
                                    {isVisible ? (
                                        <Slide publication={publication} />
                                    ) : (
                                        <div className="w-full h-full" /> // Placeholder pour les slides non visibles
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="snap-start h-[92vh] flex items-center justify-center">
                            Aucune publication trouvée.
                        </p>
                    )
                )}
            </div>
        </div>
    );
}
