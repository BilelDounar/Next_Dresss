"use client";

import { useEffect, useState } from "react";
import Slide from "@/app/Components/navigation/Slide";

const fetchPosts = async (page: number) => {
    const fakePosts = Array.from({ length: 5 }, (_, i) => ({
        id: page * 5 + i + 1,
        content: `Post #${page * 5 + i + 1}`
    }));
    return new Promise(resolve => {
        setTimeout(() => resolve(fakePosts), 1000);
    });
};

export default function HomePage() {
    const [posts, setPosts] = useState<{ id: number; content: string }[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        setLoading(true);
        const newPosts = (await fetchPosts(page)) as { id: number; content: string }[];
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
        setLoading(false);
    };

    useEffect(() => {
        loadMore();
    }, []);

    return (
        <div className="flex flex-row">
            <div className="snap-y snap-mandatory overflow-y-scroll h-[92vh] w-full min-[750px]:max-w-[500px] min-[750px]:h-screen min-[750px]:w-screen">
                {loading ? (
                    <div className="snap-start h-[92vh] min-[750px]:h-screen flex items-center justify-center">
                        <p className="fixed top-[40%] right-[40%]">Chargement...</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <Slide key={post.id} id={post.id} content={post.content} />
                    ))
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
