"use client";

import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SlideProps = {
    id: number;
    content: string;
};

export default function Slide({ id, content }: SlideProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const slidesCount = 10; // Total des slides horizontaux
    const visibleDots = 3;  // Nombre de bulles visibles en permanence

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                });
            },
            { threshold: 0.7 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isVisible && horizontalRef.current) {
            horizontalRef.current.scrollTo({ left: 0, behavior: "smooth" });
            setActiveIndex(0);
        }
    }, [isVisible]);

    const handleScroll = () => {
        if (horizontalRef.current) {
            const scrollLeft = horizontalRef.current.scrollLeft;
            const width = horizontalRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    };

    // Calculer les index des bulles visibles
    const dotIndices = () => {
        let indices: number[] = [];

        if (slidesCount <= visibleDots) {
            // Si moins de slides que visibleDots, montre tous les indices
            indices = Array.from({ length: slidesCount }, (_, i) => i);
        } else {
            // Cas normal : centrer autour de activeIndex
            let start = Math.max(0, activeIndex - Math.floor(visibleDots / 2));
            let end = start + visibleDots;

            if (end > slidesCount) {
                end = slidesCount;
                start = end - visibleDots;
            }

            indices = Array.from({ length: visibleDots }, (_, i) => start + i);
        }

        return indices;
    };


    return (
        <div
            ref={containerRef}
            className="snap-start h-[92vh] min-[750px]:min-[600px]:h-screen flex flex-col border-b border-gray-300 relative"
            style={{ background: `hsl(${id * 30}, 70%, 80%)` }}>

            <div className="absolute bottom-30 right-4 flex flex-col gap-y-5">
                <div className="flex flex-col justify-center text-center">
                    <Heart color="white" size={40} className="drop-shadow" />
                    <span className="text-xl text-white font-semibold">50k</span>
                </div>
                <div className="flex flex-col justify-center text-center">
                    <MessageCircle color="white" size={40} className="drop-shadow" />
                    <span className="text-xl text-white font-semibold">50k</span>
                </div>
                <div className="flex flex-col justify-center text-center">
                    <Share2 color="white" size={40} className="drop-shadow" />
                    <span className="text-xl text-white font-semibold">50k</span>
                </div>
                <div className="flex flex-col justify-center text-center">
                    <Bookmark color="white" size={40} className="drop-shadow" />
                    <span className="text-xl text-white font-semibold">50k</span>
                </div>
            </div>

            <div
                ref={horizontalRef}
                className="flex overflow-x-scroll snap-x snap-mandatory w-full h-full"
                onScroll={handleScroll}
            >
                {Array.from({ length: slidesCount }).map((_, num) => (
                    <div
                        key={num}
                        className="snap-start w-full flex-shrink-0 flex items-center justify-center text-black text-2xl"
                        style={{ minWidth: "100%" }}
                    >
                        Slide {num + 1} of {content}
                    </div>
                ))}
            </div>

            {/* Petites bulles indicatrices (toujours 3 visibles) */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2">
                {dotIndices().map(idx => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === activeIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
}
