"use client";

import { useEffect, useState, useRef } from "react";
import Slide from "@/app/Components/navigation/Slide";

// Type pour une publication, correspondant à l'API
type Publication = {
    _id: string;
    description: string;
    urlsPhotos: string[];
    user: string;
};

export default function HomePage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const observer = useRef<IntersectionObserver | null>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const fetchPublications = async () => {
            setLoading(true);
            try {
                // TODO: Replace with the actual authenticated user's ID
                const userId = "6671c4a13123282b79c3a25a"; // Hardcoded for demonstration
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const response = await fetch(`${apiUrl}/api/publications?userId=${userId}`);
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

        fetchPublications();
    }, []);

    // Met en place l'Intersection Observer pour la virtualisation
    useEffect(() => {
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

        const currentObserver = observer.current;
        slideRefs.current.forEach((ref) => {
            if (ref) currentObserver.observe(ref);
        });

        return () => {
            slideRefs.current.forEach((ref) => {
                if (ref && currentObserver) currentObserver.unobserve(ref);
            });
        };
    }, [publications]);

    return (
        <div className="flex flex-row">
            <div className="snap-y snap-mandatory overflow-y-scroll h-[92vh] w-full min-[750px]:max-w-[500px] min-[750px]:h-screen min-[750px]:w-screen bg-primary-300">
                {loading ? (
                    <div className="snap-start h-[92vh] min-[750px]:h-screen flex items-center justify-center">
                        <p className="fixed top-[40%] right-[40%] text-white">Chargement...</p>
                    </div>
                ) : (
                    publications.map((publication, index) => {
                        // Affiche le slide s'il est actif, ou celui d'avant/après
                        const isVisible = Math.abs(index - activeIndex) <= 1;

                        return (
                            <div
                                key={publication._id}
                                ref={(el) => (slideRefs.current[index] = el)}
                                data-index={index}
                                className="snap-start w-full h-[92vh] min-[750px]:h-screen" // Conteneur pour l'observer
                            >
                                {isVisible ? (
                                    <Slide publication={publication} id={index} />
                                ) : (
                                    <div className="w-full h-full" /> // Placeholder pour les slides non visibles
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bloc latéral visible uniquement sur grand écran */}
            {!loading && (
                <div className="max-[750px]:hidden bg-amber-200 w-full">
                    {/* Contenu réel à mettre ici */}
                    <p>Contenu latéral</p>
                </div>
            )}
        </div>
    );
}
