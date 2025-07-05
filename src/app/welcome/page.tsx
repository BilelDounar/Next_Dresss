// src/app/register/page.tsx
"use client";

import Image from 'next/image';
import Button from "@/components/atom/button";

export default function RegisterPage() {
    return (
        <div className="flex flex-col h-full items-center">
            <Image
                src="./photo/welcome_bg.jpg"
                alt="Background"
                width={1920}
                height={1080}
                className="h-1/2 lg:h-[30vh] w-full object-cover"
            />
            <div className="h-1/2 lg:h-[30vh] flex flex-col items-center">
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
                        <Button type="button" openLink="/login" variant="link" className="w-full text-sm">
                            Condition d&apos;utilisation
                        </Button>
                        <Button type="button" openLink="/login" variant="link" className="w-full text-sm">
                            Politique de confidentialité
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}