"use client";

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Avatar from '@/components/atom/avatar';
import Image from 'next/image';

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

interface NotificationItemProps {
    notification: Notification;
    actors: Record<string, string>;
}

function NotificationItem({ notification, actors }: NotificationItemProps) {
    const formatRelative = (dateStr: string) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const sec = Math.floor(diffMs / 1000);
        if (sec < 60) return `${sec}s`;
        const min = Math.floor(sec / 60);
        if (min < 60) return `${min}m`;
        const h = Math.floor(min / 60);
        if (h < 24) return `${h}h`;
        const d = Math.floor(h / 24);
        return `${d}j`;
    };

    const message = notification.kind === 'follow'
        ? ` a commencé à vous suivre`
        : notification.text;

    // Récupère le pseudo de l'auteur de la notification (peut être indisponible)
    const pseudo = actors[notification.from] ?? '';
    const initial = pseudo ? pseudo.charAt(0).toUpperCase() : '?';

    return (
        <div className="flex justify-between items-start bg-[#F8F5F2] p-2 rounded">
            {/* Avatar + texte */}
            <div className="flex items-start gap-x-3 max-w-[70%]">
                <Avatar
                    alt={initial}
                    size="sm"
                    src={notification.from.startsWith('/uploads/') ? notification.from : `${process.env.NEXT_PUBLIC_API_MONGO ?? ''}${notification.from}`}
                    clickable={true}
                    href={`/profil/${notification.from}`}
                    isFollowed={true}
                />
                <p className="text-sm leading-snug line-clamp-2">
                    <span className="font-bold">@{pseudo || "Utilisateur Introuvable"}</span>
                    {message}
                </p>
            </div>

            {/* preview + time */}
            <div className="flex flex-row items-center justify-center gap-x-2">
                {/* Si on a un visuel (ex: like sur un look) */}
                {notification.targetType === 'post' && notification.targetId && (
                    <Image
                        src={`${process.env.NEXT_PUBLIC_API_MONGO ?? ''}${notification.targetId.startsWith('/') ? '' : '/'}${notification.targetId}`}
                        alt="Publication"
                        width={48}
                        height={48}
                        className="rounded object-cover size-12"
                    />
                )}
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatRelative(notification.createdAt)}
                </span>
            </div>
        </div>
    );
}
