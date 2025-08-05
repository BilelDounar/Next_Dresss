"use client";

import { useEffect, useState, useCallback } from "react";

interface UseSaveOptions {
    userId?: string | null;
    itemId: string;
    itemType: "publication" | "article";
}

export default function useSave({ userId, itemId, itemType }: UseSaveOptions) {
    const [saved, setSaved] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;

    const checkStatus = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${apiUrl}/api/saves/status/${userId}/${itemId}/${itemType}`);
            if (!res.ok) throw new Error("status fetch failed");
            const json = await res.json();
            setSaved(Boolean(json.saved));
        } catch (err) {
            console.error("checkSaved error", err);
        }
    }, [apiUrl, userId, itemId, itemType]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const toggleSave = async () => {
        if (!userId) return;
        try {
            if (saved) {
                await fetch(`${apiUrl}/api/saves`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user: userId, itemId, itemType }),
                });
                setSaved(false);
            } else {
                await fetch(`${apiUrl}/api/saves`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user: userId, itemId, itemType }),
                });
                setSaved(true);
            }
        } catch (err) {
            console.error("toggleSave error", err);
        }
    };

    return { saved, toggleSave };
}
