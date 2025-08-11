import Avatar from '@/components/atom/avatar';
import Image from 'next/image';

export interface Notification {
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

export interface NotificationItemProps {
    notification: Notification;
    actors: Record<string, string>;
}

export default function NotificationItem({ notification, actors }: NotificationItemProps) {
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

    const pseudo = actors[notification.from] ?? '';
    const initial = pseudo ? pseudo.charAt(0).toUpperCase() : '?';

    return (
        <div className="flex justify-between items-start bg-[#F8F5F2] p-2 rounded">
            {/* Avatar + texte */}
            <div className="flex items-start gap-x-3 max-w-[70%]">
                <Avatar
                    alt={initial}
                    size="sm"
                    src={
                        notification.from
                            ? (
                                notification.from.startsWith('https')
                                    ? notification.from
                                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE}${notification.from.replace(/^\/uploads/, '')}`
                            )
                            : undefined
                    }
                    clickable={true}
                    href={`/profil/${notification.from}`}
                    isFollowed={true}
                />
                <p className="text-sm leading-snug line-clamp-2">
                    <span className="font-bold">@{pseudo || 'Utilisateur Introuvable'}</span>
                    {message}
                </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-x-2">
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
