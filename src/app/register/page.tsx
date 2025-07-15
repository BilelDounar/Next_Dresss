// src/app/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/atom/input";
import Button from "@/components/atom/button";
import { ArrowLeftIcon } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        pseudo: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Gérer les erreurs de validation de Zod ou autres erreurs
                let errorMessage = data.error || "Une erreur est survenue.";
                if (data.details) {
                    const details = Object.values(data.details).flat().join(' ');
                    errorMessage += ` ${details}`;
                }
                throw new Error(errorMessage);
            }

            setSuccess("Inscription réussie ! Veuillez consulter vos emails pour vérifier votre compte.");

            // // Rediriger vers la page de vérification après un court délai
            // setTimeout(() => {
            //     router.push('/verify');
            // }, 2000);

            // Redirection en fonction du statut
            if (data.status === 'pending') {
                router.push('/about-you');
            } else if (data.status === 'active') {
                router.push('/home');
            } else {
                router.push('/login'); // Fallback
            }

        } catch (err) {
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
                src="/public/icons/logo_full_fit.png"
                alt="Logo"
                width={150}
                height={50}
                className="mb-8"
            />
            <h2 className="text-2xl font-bold font-outfit mb-4 text-center">Inscription</h2>

            <form onSubmit={handleSubmit} className="w-full">
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {success && <p className="text-green-500 mb-2">{success}</p>}

                <div className="mb-4">
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                    <Input type="text" name="nom" id="nom" placeholder="Nom" required onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                    <Input type="text" name="prenom" id="prenom" placeholder="Prénom" required onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">Pseudo</label>
                    <Input type="text" name="pseudo" id="pseudo" placeholder="Pseudo" required onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" name="email" id="email" placeholder="Email" required onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <Input type="password" name="password" id="password" placeholder="Mot de passe" required onChange={handleChange} />
                </div>

                <Button type="submit" className="w-full">S&apos;inscrire</Button>
            </form>
            <Link href="/login" className="mt-4 text-primary-900 hover:underline">Déjà un compte ? Connectez-vous à la place</Link>
        </div>
    );
}