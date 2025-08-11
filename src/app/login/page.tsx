// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/atom/input";
import Button from "@/components/atom/button";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuth } from "@/hooks/useRedirectIfAuth";

export default function LoginPage() {
    useRedirectIfAuth();
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        try {
            const formData = new FormData(event.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Email ou mot de passe incorrect.");
            }

            login({ user: data.user, token: data.token });

            if (data.user.status === 'pending') {
                router.push('/about-you');
            } else {
                router.push('/home');
            }

        } catch (err) {
            console.error("Erreur pendant la connexion:", err);
            if (err instanceof Error && err.message) {
                setError(err.message);
            } else {
                setError("Une erreur inattendue est survenue. Veuillez réessayer.");
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-white relative">
            <div className="absolute top-5 left-5">
                <Button type="button" openLink="/welcome" iconLeft={<ArrowLeftIcon />} size="default" variant="link" className="w-10 h-10 bg-primary-100 rounded-full flex justify-center items-center" />
            </div>
            <Image
                src="/icons/logo_full_fit.png"
                alt="Logo"
                width={150}
                height={50}
                className="mb-8"
            />
            <h2 className="text-2xl font-bold font-outfit my-4 mt-10 text-center">Connexion</h2>

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
                {error && (
                    <div className="text-left text-sm text-red-600 bg-red-100 border border-red-400 rounded-md p-3 whitespace-pre-wrap">
                        <strong>Erreur :</strong> {error}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" name="email" id="email" placeholder="Email" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <Input type="password" name="password" id="password" placeholder="Mot de passe" required />
                </div>

                <Button type="submit" className="w-full">Se connecter</Button>
            </form>
            <Link href="/register" className="mt-4 text-primary-900 hover:underline">Pas encore de compte ? Inscrivez-vous</Link>
        </div>
    );
}
