"use client";

import { usePathname } from 'next/navigation';
import DockNavigationWrapper from '@/app/Components/navigation/DockNavigationWrapper';

const noNavPaths = ['/login', '/register', '/welcome', '/about-you', '/legal', '/privacy', '/not-found'];

export default function AppShell() {
    const pathname = usePathname();

    if (noNavPaths.includes(pathname || '')) {
        return null;
    }

    return (
        <>
            {/* Espace réservé pour la barre de navigation en bas de l'écran */}
            <div className="h-[8vh]" />
            <DockNavigationWrapper />
        </>
    );
}
