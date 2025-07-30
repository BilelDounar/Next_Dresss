'use client';

import { useEffect } from 'react';
import { useLayout } from '@/context/LayoutContext';
import { ArrowLeftIcon } from 'lucide-react';
import Button from '@/components/atom/button';

export default function NotFound() {
    const { setNavbarVisible } = useLayout();

    useEffect(() => {
        setNavbarVisible(false);
        // Rétablir la visibilité lors du démontage du composant
        return () => setNavbarVisible(true);
    }, [setNavbarVisible]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center bg-white  px-6">
            <h1 className="text-[100px] font-extrabold leading-none tracking-tight text-primary-900 drop-shadow-md">404</h1>
            <p className="text-xl font-semibold mb-4">Oups... cette page est introuvable</p>
            <p className="text-sm text-gray-500 mb-6">
                On dirait que cette tenue n’a pas trouvé sa place sur le podium…
            </p>

            <Button type="button" openLink="/" iconLeft={<ArrowLeftIcon />} className="w-fit px-6" >Retour à l’accueil</Button>
        </main>
    );
}
