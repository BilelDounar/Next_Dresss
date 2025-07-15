// src/app/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Importer le composant Image
import { Input } from "@/components/atom/input";
import Button from "@/components/atom/button";
import { ArrowLeftIcon } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Une erreur est survenue.");
            }

            // Redirection en fonction de la vérification de l'email
            if (data.email_verified) {
                router.push('/home');
            } else {
                router.push('/verify');
            }
            router.refresh();

        } catch (err) {
            // Remplacer 'any' par un type plus spécifique
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Une erreur inconnue est survenue.');
            }
        }
    };

    return (
        <div className="flex flex-col h-screen items-center p-8 pt-25">
            <div className="fixed top-5 left-5">
                <Button type="button" openLink="/welcome" iconLeft={<ArrowLeftIcon />} size="default" variant="link" className="w-10 h-10 bg-primary-100 rounded-full flex justify-center items-center" />
            </div>
            <Image
                src="./icons/logo_full_fit.png"
                alt="Logo"
                width={200}
                height={200}
                objectFit="cover"
            />
            <h2 className="text-2xl font-bold font-outfit mb-4 text-center">Connexion</h2>

            <form onSubmit={handleSubmit} className="w-full">
                {error && <p className="text-red-500 mb-2">{error}</p>}

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" name="email" id="email" placeholder="Email" required onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <Input type="password" name="password" id="password" placeholder="Mot de passe" required onChange={handleChange} />
                </div>

                <Button type="submit" className="w-full">Se connecter</Button>
            </form>
            <Link href="/register" className="mt-4 text-primary-900 hover:underline">Pas encore de compte ? Inscrivez-vous</Link>
        </div>
    );
}
