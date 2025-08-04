"use client";

import { useState, useEffect, Fragment } from "react";
import { ArrowLeft, LogOut, Trash } from "lucide-react";
import Button from "@/components/atom/button";
import { Input } from "@/components/atom/input";
import { Transition, TransitionChild } from "@headlessui/react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordChange: (oldPw: string, newPw: string) => Promise<void>;
    onDeleteAccount: () => Promise<void>;
    onLogout: () => Promise<void> | void;
}

export default function SettingsModal({ isOpen, onClose, onPasswordChange, onDeleteAccount, onLogout }: SettingsModalProps) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPw, setLoadingPw] = useState(false);
    const [errorPw, setErrorPw] = useState<string | null>(null);
    const [successPw, setSuccessPw] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Auto-clear messages after 5 seconds
    useEffect(() => {
        if (errorPw) {
            const timer = setTimeout(() => setErrorPw(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorPw]);

    useEffect(() => {
        if (successPw) {
            const timer = setTimeout(() => setSuccessPw(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [successPw]);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setErrorPw("Tous les champs sont requis");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorPw("Les nouveaux mots de passe ne correspondent pas");
            return;
        }
        try {
            setLoadingPw(true);
            setErrorPw(null);
            await onPasswordChange(oldPassword, newPassword);
            setSuccessPw(true);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
            setErrorPw(message);
        } finally {
            setLoadingPw(false);
        }
    };

    const handleDelete = () => {
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        setLoadingDelete(true);
        try {
            await onDeleteAccount();
        } finally {
            setLoadingDelete(false);
            setConfirmOpen(false);
        }
    };

    return (
        <Transition
            as="div"
            show={isOpen}
            enter="transform transition-transform duration-500"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition-transform duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
            className="fixed inset-0 z-50 flex flex-col bg-[#F5F5F1]"
        >
            {/* Header */}
            <header className="flex items-center my-8 px-4">
                <button onClick={onClose} className="flex items-center font-serif text-lg">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </button>
            </header>

            {/* Body */}
            <div className="flex-grow overflow-y-auto px-4 space-y-8">
                {/* Change pwd */}
                <section>
                    <h2 className="font-serif text-xl font-bold mb-4">Changer votre mot de passe</h2>
                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Ancien mot de passe"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errorPw && <p className="text-red-600 text-sm">{errorPw}</p>}
                        {successPw && <p className="text-green-600 text-sm">Mot de passe mis à jour ✔</p>}
                        <Button onClick={handleChangePassword} disabled={loadingPw}
                            className="w-full font-semibold text-base">
                            {loadingPw ? "Mise à jour…" : "Mettre à jour"}
                        </Button>
                    </div>
                </section>

                <hr className="border-gray-300" />

                {/* Delete account */}
                <section className="space-y-4">
                    <Button variant="destructive" disabled={loadingDelete} iconLeft={<Trash />} onClick={handleDelete}
                        className="w-full font-semibold text-base text-white">
                        {loadingDelete ? "Suppression…" : "Supprimer mon compte"}
                    </Button>
                </section>

                <hr className="border-gray-300" />


                {/* Logout */}
                <section className="space-y-4 pb-12">
                    <Button variant="ghost" iconLeft={<LogOut />} onClick={onLogout} className="w-full font-semibold text-xl">
                        Se déconnecter
                    </Button>
                </section>
            </div>

            {/* Confirm delete modal */}
            <Transition show={confirmOpen} as={Fragment}>
                <div className="fixed inset-0 z-60 flex items-center justify-center">
                    {/* backdrop */}
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
                    </TransitionChild>

                    {/* panel */}
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="scale-95 opacity-0" enterTo="scale-100 opacity-100" leave="ease-in duration-200" leaveFrom="scale-100 opacity-100" leaveTo="scale-95 opacity-0">
                        <div className="relative bg-white rounded-lg p-6 w-80 max-w-full shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">Supprimer le compte ?</h3>
                            <p className="text-sm text-gray-600 mb-6 font-outfit">Cette action est irréversible.</p>
                            <div className="flex justify-end space-x-3 font-outfit">
                                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Annuler</Button>
                                <Button variant="destructive" className="text-white" disabled={loadingDelete} onClick={handleConfirmDelete}>
                                    {loadingDelete ? 'Suppression…' : 'Supprimer'}
                                </Button>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </Transition>
        </Transition>
    );
}
