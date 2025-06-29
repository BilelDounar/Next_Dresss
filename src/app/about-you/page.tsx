// src/app/about-you/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/atom/button";
import { Input } from "@/components/atom/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/atom/select";
import { MultiSelect } from "@/components/atom/multi-select";

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
    const [formData, setFormData] = useState({
        genre: "",
        dateOfBirth: "",
        height: "",
        preferredStyles: [] as string[],
    });

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
        console.log("User details:", formData);
        // TODO: Envoyer les données à une API pour les sauvegarder
        // Pour l'instant, on redirige vers la page d'accueil
        router.push('/home');
    };

    return (
        <div className="flex flex-col h-screen items-center p-8 pt-20">
            <h2 className="text-2xl font-bold font-outfit mb-4 text-center">Définissez votre style</h2>
            <p className="text-center text-gray-600 mb-8 max-w-md">Aidez-nous à personnaliser votre expérience en partageant quelques informations.</p>

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

                <Button type="submit" className="w-full p-6">Continuer</Button>
            </form>
        </div>
    );
}