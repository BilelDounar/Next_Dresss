"use client";

import { useEffect, useRef, useState, Fragment } from "react";
import { useAuth } from "@/hooks/useAuth";
import HomeBagIcon from "../home/HomeBagIcon";
import { Transition } from '@headlessui/react'
import CardItem from "../home/CardItem";
import ActionButton from "../home/ActionButton";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "../home/ActionIconSVG";
import Image from 'next/image';
import Avatar from "@/components/atom/avatar";

// Type pour un article
type Article = {
    _id: string;
    titre: string;
    description: string;
    prix: number;
    urlPhoto: string;
    lien?: string;
};

// Type pour une publication
type Publication = {
    _id: string;
    description: string;
    user: string;
    urlsPhotos?: string[];
    articles?: Article[];
};

// Type pour les props du composant Slide
type SlideProps = {
    publication: Publication;
};

export default function Slide({ publication }: SlideProps) {
    const { user } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [articles, setArticles] = useState<Article[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(true);

    // La publication actuelle est directement celle passée en props.
    const currentPublication = publication;

    useEffect(() => {
        const markAsViewed = async () => {
            if (isVisible && currentPublication && user) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                    await fetch(`${apiUrl}/api/publications/${currentPublication._id}/view`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: user.id }),
                    });
                } catch (error) {
                    console.error("Failed to mark publication as viewed:", error);
                }
            }
        };

        markAsViewed();
    }, [isVisible, currentPublication, user]);

    useEffect(() => {
        const fetchArticlesForCurrentPublication = async () => {
            if (!currentPublication) {
                setArticles([]);
                return;
            }

            setLoadingArticles(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const response = await fetch(`${apiUrl}/api/publications/${currentPublication._id}/articles`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch articles for publication ${currentPublication._id}`);
                }
                const articlesData: Article[] = await response.json();
                setArticles(articlesData);
            } catch (error) {
                console.error("Error fetching articles:", error);
                setArticles([]);
            } finally {
                setLoadingArticles(false);
            }
        };

        fetchArticlesForCurrentPublication();
    }, [currentPublication]);

    // Calcule le nombre de diapositives en toute sécurité.
    const slidesCount = currentPublication?.urlsPhotos?.length || 0;
    const visibleDots = 3;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.7 }
        );

        const node = containerRef.current;
        if (node) observer.observe(node);

        return () => {
            if (node) observer.unobserve(node);
        };
    }, []);

    useEffect(() => {
        if (isVisible && horizontalRef.current) {
            horizontalRef.current.scrollTo({ left: 0, behavior: "smooth" });
            setActiveIndex(0);
        }
    }, [isVisible]);

    useEffect(() => {
        if (horizontalRef.current) {
            const scrollLeft = horizontalRef.current.scrollLeft;
            const width = horizontalRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    }, [horizontalRef]);

    const handleScroll = () => {
        if (horizontalRef.current) {
            const scrollLeft = horizontalRef.current.scrollLeft;
            const width = horizontalRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    };

    const dotIndices = () => {
        if (slidesCount <= visibleDots) {
            return Array.from({ length: slidesCount }, (_, i) => i);
        }
        let start = Math.max(0, activeIndex - Math.floor(visibleDots / 2));
        let end = start + visibleDots;
        if (end > slidesCount) {
            end = slidesCount;
            start = end - visibleDots;
        }
        return Array.from({ length: visibleDots }, (_, i) => start + i);
    };

    useEffect(() => {
        const handleStart = (e: TouchEvent | MouseEvent) => {
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            startY.current = clientY;
            setIsDragging(true);
        };

        const handleMove = (e: TouchEvent | MouseEvent) => {
            if (!isDragging || startY.current === null) return;
            const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaY = currentY - startY.current;
            if (deltaY > 0) {
                setDragOffset(deltaY);
            }
        };

        const handleEnd = () => {
            if (dragOffset > 100) {
                setIsModalOpen(false);
            }
            setDragOffset(0);
            setIsDragging(false);
            startY.current = null;
        };

        window.addEventListener("touchstart", handleStart);
        window.addEventListener("touchmove", handleMove);
        window.addEventListener("touchend", handleEnd);
        window.addEventListener("mousedown", handleStart);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleEnd);

        return () => {
            window.removeEventListener("touchstart", handleStart);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleEnd);
            window.removeEventListener("mousedown", handleStart);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleEnd);
        };
    }, [dragOffset, isDragging]);

    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);
    const [isAnimatingMark, setIsAnimatingMark] = useState(false);
    const actions = [
        {
            icon: (
                <div className={`transition-transform duration-200 ease-out ${isAnimatingHeart ? "scale-125" : "scale-100"}`}>
                    <HeartIcon fill={isLiked ? "red" : "white"} />
                </div>
            ),
            count: 500,
            onClick: () => {
                setIsLiked(!isLiked);
                setIsAnimatingHeart(true);
                setTimeout(() => setIsAnimatingHeart(false), 200); // réinitialise après 200ms
            },
        },
        {
            icon: <CommentIcon fill="white" />,
            count: 120,
            onClick: () => console.log("comment"),
        },
        {
            icon: <ShareIcon fill="white" />,
            count: 75,
            onClick: () => console.log("share"),
        },
        {
            icon: <div className={`transition-transform duration-200 ease-out ${isAnimatingMark ? "scale-125" : "scale-100"}`}>
                <BookmarkIcon fill={isSaved ? "yellow" : "white"} />
            </div>,
            count: 520,
            onClick: () => {
                setIsSaved(!isSaved);
                setIsAnimatingMark(true);
                setTimeout(() => setIsAnimatingMark(false), 200); // réinitialise après 200ms
            },
        },
    ];

    return (
        <div
            ref={containerRef}
            className="w-full h-[90vh] min-[750px]:min-[600px]:h-screen flex flex-col relative bg-primary-300" // Taille contrôlée par le parent, fond noir
        >
            <div className="absolute bottom-36 right-4 flex flex-col justify-center items-center gap-y-5 z-10">
                {actions.map(({ icon, count, onClick }, index) => (
                    <ActionButton
                        key={index}
                        Icon={icon}
                        count={count}
                        onClick={onClick}
                    />
                ))}
            </div>

            <div
                ref={horizontalRef}
                className="flex overflow-x-scroll snap-x snap-mandatory w-full h-full"
                onScroll={handleScroll}
            >
                {currentPublication?.urlsPhotos?.map((url, idx) => (
                    <div
                        key={`${currentPublication._id}-${idx}`}
                        className="snap-start w-full h-full flex-shrink-0 relative flex items-center justify-center bg-primary-300" // Assure un fond noir pour l'image
                        style={{ minWidth: "100%" }}
                    >
                        <Image
                            src={url}
                            alt={`Photo ${idx + 1} de la publication`}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            <div className="absolute bottom-22 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {dotIndices().map((idx) => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === activeIndex ? "bg-white" : "bg-white/50"}`}
                    />
                ))}
            </div>

            {currentPublication && (
                <div className="absolute bottom-4 px-4 w-full flex justify-between items-center z-10">
                    <div className="flex flex-row gap-4">
                        <Avatar src="https://avatars.githubusercontent.com/u/105309377?v=4" alt="BD" size="md" isFollowed={false} onClick={() => console.log("clicked")} />
                        <div>
                            <h2 className="text-white font-bold text-lg truncate w-full max-w-[140px] min-[500px]:max-w-[250px] min-[600px]:max-w-[400px] min-[749px]:max-w-[500px] min-[750px]:max-w-[0]">
                                {currentPublication._id}
                            </h2>
                            <p className="text-white font-normal text-md truncate w-full max-w-[140px] min-[500px]:max-w-[250px] min-[600px]:max-w-[400px] min-[749px]:max-w-[500px] min-[750px]:max-w-[0]">
                                {currentPublication.description}
                            </p>
                        </div>
                    </div>

                    <div>
                        <button
                            className="btn border-none bg-white rounded-full px-4 py-2.5 flex flex-row gap-x-1 items-center"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <HomeBagIcon value={articles.length.toString()} />
                            <span className="text-base font-semibold text-gray-800">articles</span>
                        </button>
                    </div>
                </div>
            )}

            <Transition show={isModalOpen} as={Fragment}>
                <div className="fixed inset-0 z-50">
                    <Transition
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="absolute inset-0 bg-black/20 bg-opacity-40"
                            onClick={() => setIsModalOpen(false)}
                        />
                    </Transition>

                    <Transition
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="translate-y-full"
                        enterTo="translate-y-[30vh]"
                        leave="ease-in duration-200"
                        leaveFrom="translate-y-[30vh]"
                        leaveTo="translate-y-full"
                    >
                        <div
                            ref={sheetRef}
                            className="absolute bottom-0 w-full h-[80vh] bg-white rounded-t-2xl shadow-xl p-6"
                            style={{
                                transform: `translateY(${dragOffset}px)`,
                                transition: isDragging ? "none" : "transform 0.2s ease-out",
                            }}
                        >
                            <div className="mx-auto mb-2 w-12 h-1.5 bg-gray-300 rounded-full" />
                            <div className="flex justify-between items-center my-4">
                                <h2 className="text-lg font-semibold font-outfit">Ou les retrouver ?</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-800"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Fermer
                                </button>
                            </div>
                            <div className=" flex flex-col h-full gap-y-4 overflow-y-scroll pb-28">
                                {!loadingArticles && articles.map((article) => (
                                    <CardItem key={article._id} price={article.prix} title={article.titre} description={article.description} urlPhoto={article.urlPhoto} openLink={article.lien || '#'} />
                                ))}
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </div>
    );
}
