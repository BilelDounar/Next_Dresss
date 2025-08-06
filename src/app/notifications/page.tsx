"use client";

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Image from 'next/image';
import NotificationItem from '@/components/notifications/NotificationItem';

interface Notification {
    _id: string;
    user: string;
    from: string;
    kind: 'follow' | 'like' | 'comment' | 'system';
    targetId?: string | null;
    targetType?: string | null;
    text: string;
    seen: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const { user } = useRequireAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [actors, setActors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user?.id) return;
        const fetchNotifs = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;
                const res = await fetch(`${apiUrl}/api/notifications/user/${user.id}`);
                if (!res.ok) throw new Error('Erreur fetch notifications');
                const data: Notification[] = await res.json();
                const uniqueFromIds = Array.from(new Set(data.map(n => n.from)));
                // fetch pseudos in parallel
                const fetched: Record<string, string> = {};
                await Promise.all(uniqueFromIds.map(async (uid) => {
                    try {
                        const resUser = await fetch(`/api/users?id=${uid}`);
                        if (resUser.ok) {
                            const u = await resUser.json();
                            fetched[uid] = u.pseudo || uid;
                        }
                    } catch { }
                }));
                setActors(fetched);
                setNotifications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifs();
    }, [user?.id]);

    return (
        <div className="h-screen flex flex-col bg-[#F8F5F2] relative">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-y-0 z-20">
                {loading && <p className="text-center text-gray-500">Chargement...</p>}
                {!loading && notifications.length === 0 && (
                    <p className="text-center text-gray-500">Aucune notification</p>
                )}
                {notifications.map((notif) => (
                    <NotificationItem key={notif._id} notification={notif} actors={actors} />
                ))}
            </div>

            {/* Watermark logo */}
            <div className="pointer-events-none select-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <Image
                    src="/icons/logo.png"
                    alt="Logo"
                    width={128}
                    height={128}
                    className="opacity-7"
                />
            </div>
        </div>
    );
}
