"use client";

import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState, Fragment } from "react";
import HomeBagIcon from "../home/HomeBagIcon";
import { Dialog, Transition } from "@headlessui/react";
import AvatarAtom from "@/components/atom/avatar";

type SlideProps = {
    id: number;
    content: string;
};

export default function Slide({ id, content }: SlideProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const slidesCount = 10;
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

    return (
        <div
            ref={containerRef}
            className="snap-start h-[92vh] min-[750px]:min-[600px]:h-screen flex flex-col border-b border-gray-300 relative"
            style={{ background: `hsl(${id * 30}, 70%, 80%)` }}
        >
            <div className="absolute bottom-30 right-4 flex flex-col gap-y-5">
                {[Heart, MessageCircle, Share2, Bookmark].map((Icon, index) => (
                    <div key={index} className="flex flex-col justify-center text-center">
                        <Icon color="white" size={40} className="drop-shadow" />
                        <span className="text-xl text-white font-semibold">50k</span>
                    </div>
                ))}
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

            <div className="absolute bottom-25 left-1/2 transform -translate-x-1/2 flex gap-2">
                {dotIndices().map((idx) => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === activeIndex ? "bg-white" : "bg-white/50"}`}
                    />
                ))}
            </div>

            <div className="absolute bottom-4 px-4 w-full flex justify-between items-center">
                <div className="flex flex-row gap-4">
                    <AvatarAtom src="https://avatars.githubusercontent.com/u/105309377?v=4" alt="BD" size="md" isFollowed={false} onClick={() => console.log("clicked")}  />
                    <div>
                        <h2 className="text-white text-lg font-bold">@Bilel</h2>
                        <p className="text-white font-normal truncate w-full max-w-[140px] min-[500px]:max-w-[250px] min-[600px]:max-w-[400px] min-[749px]:max-w-[500px] min-[750px]:max-w-[0]">
                            lorem ipsum dolor sit amet consectetur adipisicing elit.
                        </p>
                    </div>
                </div>
                <div>
                    <button
                        className="btn border-none bg-white rounded-full px-4 py-2.5 flex flex-row gap-x-1 items-center"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <HomeBagIcon value="1" />
                        <span className="text-base font-semibold text-gray-800">articles</span>
                    </button>
                </div>
            </div>

            <Transition show={isModalOpen} as={Fragment}>
                <div className="fixed inset-0 z-50">
                    <Transition.Child
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
                    </Transition.Child>

                    <Transition.Child
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
                            className="absolute bottom-0 w-full h-[70vh] bg-white rounded-t-2xl shadow-xl p-6"
                            style={{
                                transform: `translateY(${dragOffset}px)`,
                                transition: isDragging ? "none" : "transform 0.2s ease-out",
                            }}
                        >
                            <div className="mx-auto mb-2 w-12 h-1.5 bg-gray-300 rounded-full" />
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Tes articles</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-800"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Fermer
                                </button>
                            </div>
                            <div className="overflow-y-auto h-full gap-y-2 pr-2 flex flex-row gap-x-2 justify-between flex-wrap mb-[2000px]">


                                <div className="flex flex-row items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 h-fit">
                                    <img className="object-cover w-[100px] h-[100px] rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="/icons/icon-256x256.png" alt="" />
                                    <div className="flex flex-col justify-between p-4 leading-normal">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
                                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 h-fit">
                                    <img className="object-cover w-[100px] h-[100px] rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="/icons/icon-256x256.png" alt="" />
                                    <div className="flex flex-col justify-between p-4 leading-normal">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
                                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 h-fit">
                                    <img className="object-cover w-[100px] h-[100px] rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="/icons/icon-256x256.png" alt="" />
                                    <div className="flex flex-col justify-between p-4 leading-normal">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
                                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Transition>
        </div>
    );
}
