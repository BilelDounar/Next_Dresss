"use client";
import { useState, useEffect, useCallback } from "react";

interface UseFollowReturn {
    isFollowing: boolean;
    follow: () => Promise<void>;
    unfollow: () => Promise<void>;
    loading: boolean;
}

export function useFollow(followerId?: string | number, targetId?: string | number): UseFollowReturn {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const apiBase = process.env.NEXT_PUBLIC_API_MONGO;

    // Fetch status on mount / when deps change
    useEffect(() => {
        if (!followerId || !targetId) return;
        (async () => {
            try {
                const res = await fetch(`${apiBase}/api/follows/status?follower=${followerId}&followed=${targetId}`);
                if (res.ok) {
                    const data = await res.json();
                    setIsFollowing(!!data.isFollowing);
                }
            } catch (err) {
                console.error('useFollow status err', err);
            }
        })();
    }, [followerId, targetId, apiBase]);

    const follow = useCallback(async () => {
        if (!followerId || !targetId) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/follows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ follower: followerId, followed: targetId })
            });
            if (res.ok) setIsFollowing(true);
        } finally {
            setLoading(false);
        }
    }, [followerId, targetId, apiBase]);

    const unfollow = useCallback(async () => {
        if (!followerId || !targetId) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/follows`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ follower: followerId, followed: targetId })
            });
            if (res.ok) setIsFollowing(false);
        } finally {
            setLoading(false);
        }
    }, [followerId, targetId, apiBase]);

    return { isFollowing, follow, unfollow, loading };
}