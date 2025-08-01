"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/atom/input';
import Avatar from '@/components/atom/avatar';
import Image from 'next/image';


// Type retourné par l'API
interface UserResult {
    id: number;
    nom: string;
    prenom: string;
    pseudo: string;
    profile_picture_url: string | null;
}

export default function SearchPage() {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);


    // Effect pour interroger l'API avec un léger debounce
    useEffect(() => {
        const controller = new AbortController();

        if (search.trim().length === 0) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`, {
                    signal: controller.signal,
                });
                if (res.ok) {
                    const data: UserResult[] = await res.json();
                    setResults(data);
                } else {
                    setResults([]);
                }
            } catch (err: unknown) {
                if (!(err instanceof DOMException && err.name === 'AbortError')) {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        }, 400); // 400ms debounce

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [search]);

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="h-screen flex flex-col bg-[#F8F5F2]">
            {/* Barre de recherche */}
            <div className="px-4 pt-6 pb-4 flex items-center gap-x-3">
                <Input
                    ref={inputRef}
                    placeholder="Rechercher"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-white/90 rounded-md"
                />
                <button
                    type="button"
                    onClick={() => {
                        setSearch('');
                        inputRef.current?.blur();
                    }}
                    className="text-base font-medium text-gray-600"
                >
                    Annuler
                </button>
            </div>

            {/* Résultats de recherche */}
            {search.length > 0 && (
                <div className="px-4 flex flex-col gap-y-6 z-20">
                    {loading && <span className="text-sm text-gray-500">Recherche...</span>}
                    {!loading && results.length === 0 && (
                        <span className="text-sm text-gray-500">Aucun résultat</span>
                    )}
                    <ul className="flex flex-col gap-y-6">
                        {results.map((user) => (
                            <li key={user.id}>
                                <Link href={`/profil/${user.id}`} className="flex justify-between items-center py-1">
                                    <div className="flex items-center gap-x-3">
                                        <Avatar
                                            alt={getInitials(user.pseudo)}
                                            src={user.profile_picture_url || undefined}
                                            size="md"
                                            clickable
                                            isFollowed={true}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-base font-semibold">{user.nom} {user.prenom}</span>
                                            <span className="text-sm text-gray-500">@{user.pseudo}</span>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Logo en filigrane (visible uniquement sans recherche) */}
            {search.length === 0 && (
                <div className="flex-1 flex items-center justify-center pointer-events-none select-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <Image src="/icons/logo.png" alt="Logo" width={128} height={128} className="opacity-7" />
                </div>
            )}
        </div>
    );
}
