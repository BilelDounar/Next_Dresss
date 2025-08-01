"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/atom/input';
import Avatar from '@/components/atom/avatar';
import { X } from 'lucide-react';
import Image from 'next/image';

// Définition du type pour un profil récent
type RecentProfile = {
    id: number;
    name: string;
    handle: string;
    avatar?: string;
};

export default function SearchPage() {
    const [search, setSearch] = useState('');
    const [recent, setRecent] = useState<RecentProfile[]>([
        { id: 1, name: 'Bilel Dounar', handle: '@blx___x' },
        { id: 2, name: 'Bilel Dounar', handle: '@blx___x' },
        { id: 3, name: 'Bilel Dounar', handle: '@blx___x' },
        { id: 4, name: 'Bilel Dounar', handle: '@blx___x' },
        { id: 5, name: 'Bilel Dounar', handle: '@blx___x' },
    ]);

    const removeRecent = (id: number) => {
        setRecent((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="h-screen flex flex-col bg-primary-300">
            {/* Barre de recherche */}
            <div className="px-4 pt-6 pb-4 flex items-center gap-x-3">
                <Input
                    placeholder="Rechercher"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-white/90 rounded-md"
                />
                <Link href="/home" className="text-base font-medium text-gray-600">
                    Annuler
                </Link>
            </div>

            {/* Section Récent */}
            {search.length === 0 && recent.length > 0 && (
                <div className="px-4 flex flex-col gap-y-6 z-20">
                    <h2 className="text-sm text-gray-500 font-semibold">Récent</h2>
                    <ul className="flex flex-col gap-y-0">
                        {recent.map((profile) => (
                            <li key={profile.id} className="flex justify-between items-center bg-primary-300 py-2">
                                <div className="flex items-center gap-x-3">
                                    <Avatar alt={profile.name} src={profile.avatar} size="sm" />
                                    <div className="flex flex-col">
                                        <span className="text-base font-semibold">{profile.name}</span>
                                        <span className="text-sm text-gray-500">{profile.handle}</span>
                                    </div>
                                </div>
                                <button onClick={() => removeRecent(profile.id)} aria-label="Supprimer de la liste">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Logo en filigrane */}
            <div className="flex-1 flex items-center justify-center pointer-events-none select-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
               <Image src="/icons/logo.png" alt="Logo" width={128} height={128} className="opacity-7" />
            </div>
        </div>
    );
}
