"use client";

import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import HomeBagIcon from "../home/HomeBagIcon";

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
    const visibleDots = 3; // Nombre de bulles visibles en permanence

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
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
            style={{ background: `hsl(${id * 30}, 70%, 80%)` }}
        >
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
            <div className="absolute bottom-25 left-1/2 transform -translate-x-1/2 flex gap-2">
                {dotIndices().map((idx) => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === activeIndex ? "bg-white" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>

            <div className="absolute bottom-4 px-4 w-full gap-x-2 flex justify-between items-center">
                <div className="flex flex-row gap-4">
                    <div className="avatar avatar-online avatar-placeholder ">
                        <div className="bg-primary-100 text-primary-900 font-bold w-14 rounded-full">
                            <span className=" text-2xl">D</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold">@Bilel</h2>
                        <p className="text-white font-normal truncate w-full max-w-[140px] min-[500px]:max-w-[250px] min-[600px]:max-w-[400px] min-[749px]:max-w-[500px] min-[750px]:max-w-[0]">
                            lorem ipsum dolor sit amet consectetur adipisicing elit.
                        </p>

                    </div>
                </div>
                <div>
                    <button className="btn border-none bg-white rounded-full px-4 py-2.5 flex flex-row gap-x-1 items-center">
                        <HomeBagIcon value="5" />
                        <span className="text-base font-semibold text-gray-800">articles</span>
                    </button>
                </div>
            </div>

            <button type="button" className="btn btn-primary" aria-haspopup="dialog" aria-expanded="false" aria-controls="overlay-body-scrolling" data-overlay="#overlay-body-scrolling">
                Body scrolling (no backdrop)
            </button>

            {/* <div id="overlay-body-scrolling" className="overlay overlay-open:translate-x-0 drawer drawer-start hidden [--body-scroll:true] [--overlay-backdrop:false]" role="dialog" tabindex="-1">
                <div className="drawer-header">
                    <h3 className="drawer-title">Drawer Title</h3>
                    <button type="button" className="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" data-overlay="#overlay-body-scrolling">
                        <span className="icon-[tabler--x] size-5"></span>
                    </button>
                </div>
                <div className="drawer-body">
                    <p>
                        Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
                    </p>
                </div>
                <div className="drawer-footer">
                    <button type="button" className="btn btn-soft btn-secondary" data-overlay="#overlay-body-scrolling">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
            </div> */}
        </div>
    );
}
