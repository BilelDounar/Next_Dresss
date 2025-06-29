// src/app/register/page.tsx
"use client";

import Button from "@/components/atom/button";

export default function RegisterPage() {
    return (
        <div className="flex flex-col h-full items-center">
            <img src="./photo/welcome_bg.jpg" className="h-1/2 lg:h-[30vh] w-full object-cover" alt="" />
            <div className="h-1/2 lg:h-[30vh] flex flex-col items-center">
            <div className="flex flex-col items-center my-4">
                <p className="text-2xl font-bold text-center font-montserrat">Exprimez votre <span className="text-primary-900 text-[28px] font-logo">style</span>,</p>
                <p className="text-2xl font-bold text-center font-montserrat">Partagez votre <span className="text-primary-900 text-[28px] font-logo">look</span>!</p>
            </div>
            <div className="flex flex-col gap-y-2 w-full h-full justify-between px-4 mb-2">
                <div className="flex flex-col gap-y-2 w-full items-center px-4">
                    <Button type="button" openLink="/register" children="S'inscrire" size="default" variant="default" className="w-full p-6 text-md" />
                    <Button type="button" openLink="/login" children="Se connecter" size="default" variant="secondary" className="w-full p-6 text-md" />
                </div>
                <div className="">
                    <Button type="button" openLink="/login" children="Condition d'utilisation" variant="link" className="w-full text-sm" />
                    <Button type="button" openLink="/login" children="Politique de confidentialité" variant="link" className="w-full text-sm" />
                </div>
            </div>
            </div>
        </div>
    );
}