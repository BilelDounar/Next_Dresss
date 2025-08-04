"use client";

import { usePathname } from 'next/navigation';
import { useLayout } from '@/context/LayoutContext';
import DockNavigationWrapper from '@/components/navigation/DockNavigationWrapper';

const noNavPaths = ['/login', '/register', '/welcome', '/about-you', '/legal', '/privacy', '/not-found', '/create', '/verify'];

export default function AppShell() {
    const pathname = usePathname();
    const { isNavbarVisible } = useLayout();

    if (noNavPaths.includes(pathname || '') || !isNavbarVisible) {
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
