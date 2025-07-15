"use client";

import { usePathname } from 'next/navigation';
import DockNavigationWrapper from '@/app/Components/navigation/DockNavigationWrapper';

// Liste des pages où la barre de navigation ne doit pas apparaître
const pathsWithoutNav = [
    '/welcome',
    '/login',
    '/register',
    '/about-you',
    '/verify'
];

export default function AppShell() {
    const pathname = usePathname() || '/';

    // Vérifie si le chemin actuel est dans la liste des pages sans navigation
    const showNav = !pathsWithoutNav.includes(pathname);

    if (!showNav) {
        return null; // Ne rend rien si la navigation ne doit pas être affichée
    }

    return (
        <>
            {/* Espace réservé pour la barre de navigation en bas de l'écran */}
            <div className="h-[8vh] min-[750px]:h-0" />
            <DockNavigationWrapper />
        </>
    );
}
