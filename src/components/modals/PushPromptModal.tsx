"use client";

import { Fragment } from "react";
import { Transition, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "@/components/atom/button";

interface PushPromptModalProps {
    show: boolean;
    onAccept: () => void;
    onClose: () => void;
}

export default function PushPromptModal({ show, onAccept, onClose }: PushPromptModalProps) {
    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
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

                {/* Panel */}
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
                            <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                                Activer les notifications ?
                            </DialogTitle>
                            <p className="text-sm text-gray-700 mb-6">
                                Recevez des mises à jour instantanées même lorsque l&apos;application est fermée.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={onClose}>
                                    Plus tard
                                </Button>
                                <Button className="flex-1" onClick={onAccept}>
                                    Autoriser
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
