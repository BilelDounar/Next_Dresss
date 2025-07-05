// src/app/about-you/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/atom/button";
import { Input } from "@/components/atom/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/atom/select";
import { MultiSelect } from "@/components/atom/multi-select";
import { useAuth } from "@/hooks/useAuth";

const styleOptions = [
    { value: "streetwear", label: "Streetwear" },
    { value: "casual", label: "Casual" },
    { value: "chic", label: "Chic" },
    { value: "vintage", label: "Vintage" },
    { value: "sportswear", label: "Sportswear" },
    { value: "minimalist", label: "Minimaliste" },
    { value: "street", label: "Street" },
    { value: "Autre", label: "Autre" },
];

export default function AboutYouPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            if (user.status === 'active') {
                router.push('/home');
            } else if (user.status === 'disabled') {
                router.push('/welcome');
            }
        }
    }, [user, authLoading, router]);

    const [formData, setFormData] = useState({
        genre: "",
        dateOfBirth: "",
        height: "",
        preferredStyles: [] as string[],
    });
    const [error, setError] = useState<string | null>(null); // Pour afficher les erreurs
    const [loading, setLoading] = useState(false); // Pour gérer l'état de chargement

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value: string) => {
        setFormData({ ...formData, genre: value });
    };

    const handleMultiSelectChange = (selected: string[]) => {
        setFormData({ ...formData, preferredStyles: selected });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.genre || !formData.dateOfBirth || formData.preferredStyles.length === 0) {
            setError("Veuillez remplir tous les champs.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gender: formData.genre,
                    birthDate: formData.dateOfBirth,
                    clothingStyles: formData.preferredStyles
                }),
            });

            if (response.ok) {
                router.push('/home');
            } else {
                const data = await response.json();
                setError(data.error || "Une erreur est survenue.");
            }
        } catch (err) {
            setError("Une erreur réseau est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen items-center p-8 pt-20">
            <h2 className="text-2xl font-bold font-outfit mb-4 text-center">Définissez votre style</h2>
            <p className="text-center text-gray-600 mb-8 max-w-md">Aidez-nous à personnaliser votre expérience en partageant quelques informations.</p>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                <div className="w-full">
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <Select name="genre" value={formData.genre} required onValueChange={handleSelectChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez votre genre" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Homme</SelectItem>
                            <SelectItem value="female">Femme</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                    <Input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} required onChange={handleChange} />
                </div>

                <div className="w-full">
                    <label htmlFor="preferredStyles" className="block text-sm font-medium text-gray-700 mb-1">Vos styles préférés</label>
                    <MultiSelect
                        options={styleOptions}
                        selected={formData.preferredStyles}
                        onChange={handleMultiSelectChange}
                        placeholder="Sélectionnez vos styles"
                        className="w-full"
                    />
                </div>

                <Button type="submit" className="w-full p-6" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Continuer'}
                </Button>
            </form>
        </div>
    );
}