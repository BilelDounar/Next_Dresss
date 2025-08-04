// src/app/register/page.tsx
"use client";

import Image from 'next/image';
import Button from "@/components/atom/button";
import { useState, useEffect } from "react";
import InstallPromptModal from "@/components/modals/InstallPromptModal";
import { useRedirectIfAuth } from "@/hooks/useRedirectIfAuth";

// Define a type for the deferred install prompt event (subset we need)
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Augment the global WindowEventMap so TS recognises the event type
declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export default function RegisterPage() {
    // Empêche les utilisateurs connectés d'accéder à la page publique
    useRedirectIfAuth();
    const [showInstall, setShowInstall] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Skip if already running as installed PWA
        const nav = window.navigator as Navigator & { standalone?: boolean };
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
        if (isStandaloneMode) return;

        const ua = window.navigator.userAgent.toLowerCase();
        const android = ua.includes('android');
        const ios = /iphone|ipad|ipod/.test(ua);
        setIsAndroid(android);
        setIsIOS(ios);

        const dismissed = localStorage.getItem('pwa_install_prompt_hidden');

        // Show modal when browser fires beforeinstallprompt (Android & Desktop Chromium)
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!dismissed) setShowInstall(true);
        };
        window.addEventListener('beforeinstallprompt', handler, { once: true });

        // For iOS (Safari) there is no event, show immediately unless dismissed
        if (ios && !dismissed) {
            setShowInstall(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleClose = () => {
        setShowInstall(false);
        localStorage.setItem('pwa_install_prompt_hidden', '1');
    };

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.finally(() => {
                setDeferredPrompt(null);
                handleClose();
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-start bg-white">
            <Image
                src="/photo/welcome_bg.jpg"
                alt="Background"
                width={1920}
                height={1080}
                className="h-[50dvh] w-full object-cover"
            />
            <div className="h-[50dvh] flex flex-col items-center pt-8">
                <div className="flex flex-col items-center my-4">
                    <p className="text-2xl font-bold text-center font-montserrat">Exprimez votre <span className="text-primary-900 text-[28px] font-logo">style</span>,</p>
                    <p className="text-xl font-light text-center font-montserrat">partagez vos looks.</p>
                </div>
                <div className="flex flex-col gap-y-2 w-full h-full justify-between px-4 mb-2">
                    <div className="flex flex-col gap-y-2 w-full items-center px-4">
                        <Button type="button" openLink="/register" size="default" variant="default" className="w-full p-6 text-md">
                            S&apos;inscrire
                        </Button>
                        <Button type="button" openLink="/login" size="default" variant="secondary" className="w-full p-6 text-md">
                            Se connecter
                        </Button>
                    </div>
                    <div className="">
                        <Button type="button" openLink="/legal" variant="link" className="w-full text-sm">
                            Condition d&apos;utilisation
                        </Button>
                        <Button type="button" openLink="/privacy" variant="link" className="w-full text-sm">
                            Politique de confidentialité
                        </Button>
                    </div>
                </div>
            </div>
            <InstallPromptModal
                show={showInstall}
                onClose={handleClose}
                onInstall={handleInstall}
                isAndroid={isAndroid}
                isIOS={isIOS}
            />
        </div>
    );
}