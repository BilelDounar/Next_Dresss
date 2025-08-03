"use client";

import { Fragment } from "react";
import { Transition, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import Image from "next/image";
import Button from "@/components/atom/button";

interface InstallPromptModalProps {
    show: boolean;
    onClose: () => void;
    onInstall?: () => void;
    isAndroid: boolean;
    isIOS: boolean;
}

export default function InstallPromptModal({ show, onClose, onInstall, isAndroid, isIOS }: InstallPromptModalProps) {
    return (
        <Transition appear show={show} as={Fragment}>
            {/* Pass noop to onClose so backdrop & ESC don't close */}
            <Dialog as="div" className="relative z-50" onClose={() => { }}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" />
                </TransitionChild>

                {/* Bottom aligned container */}
                <div className="fixed inset-0 flex items-end justify-center p-4 pb-8">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="scale-95 opacity-0"
                        enterTo="scale-100 opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="scale-100 opacity-100"
                        leaveTo="scale-95 opacity-0"
                    >
                        <DialogPanel className="w-full max-w-sm transform overflow-hidden rounded-t-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <DialogTitle as="h3" className="text-lg font-semibold">
                                    Installer Dresss
                                </DialogTitle>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {isAndroid && (
                                <p className="text-sm text-gray-700 mb-4">
                                    Ajoutez Dresss à votre écran d&apos;accueil pour une expérience optimale. Appuyez sur « Installer » puis
                                    confirmez dans la boîte de dialogue du navigateur.
                                </p>
                            )}
                            {isIOS && (
                                <p className="text-sm text-gray-700 mb-4 flex items-center gap-2">
                                    <Image src="/actionIcon/share-apple.svg" alt="Partager" width={30} height={30} />
                                    <span>
                                        Sur iPhone / iPad&nbsp;: ouvrez le menu <span className="font-semibold">Partager</span> puis choisissez
                                        <span className="font-semibold"> « Sur l&apos;écran d&apos;accueil »</span> pour installer Dresss.
                                    </span>
                                </p>
                            )}
                            {!isAndroid && !isIOS && (
                                <p className="text-sm text-gray-700 mb-4">
                                    Installez Dresss comme application pour un accès plus rapide depuis votre écran d&apos;accueil.
                                </p>
                            )}

                            {isAndroid && (
                                <Button onClick={onInstall} className="w-full font-semibold text-base">
                                    Installer
                                </Button>
                            )}
                            {!isAndroid && (
                                <Button variant="secondary" onClick={onClose} className="w-full font-semibold text-base">
                                    Ok, compris
                                </Button>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
