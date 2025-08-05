"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/atom/button";
import { Textarea } from "@/components/atom/textarea";
import Avatar from "@/components/atom/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentDoc {
    _id: string;
    user: string;
    text: string;
    createdAt: string;
}

interface UserInfo {
    id: string;
    pseudo: string;
    profile_picture_url?: string;
}

interface CommentsModalProps {
    show: boolean;
    onClose: () => void;
    postId: string;
    /** Callback pour notifier le parent qu'un commentaire a été ajouté */
    onAdded?: () => void;
}

export default function CommentsModal({ show, onClose, postId, onAdded }: CommentsModalProps) {
    const { user } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_MONGO;

    const [comments, setComments] = useState<CommentDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [sending, setSending] = useState(false);
    const [usersMap, setUsersMap] = useState<Record<string, UserInfo>>({});

    // Charger commentaires + pseudos quand la modal s'ouvre
    useEffect(() => {
        if (!show) return;

        const fetchAll = async () => {
            try {
                setLoading(true);
                // 1) Commentaires depuis l'API backend
                const res = await fetch(`${apiUrl}/api/comments/${postId}`);
                if (!res.ok) throw new Error("Failed to fetch comments");
                const data: CommentDoc[] = await res.json();
                setComments(data);

                // 2) Profils manquants via l'API Next.js
                const distinctIds = Array.from(new Set(data.map((c) => c.user))).filter(
                    (id) => !(id in usersMap)
                );

                if (distinctIds.length) {
                    const profiles = await Promise.all(
                        distinctIds.map(async (uid) => {
                            const r = await fetch(`/api/users/${uid}/pseudo`);
                            if (!r.ok) return null;
                            const json = await r.json();
                            return { id: uid, pseudo: json.pseudo } as UserInfo;
                        })
                    );
                    setUsersMap((prev) => {
                        const m = { ...prev };
                        profiles.forEach((p) => {
                            if (p) m[p.id] = p;
                        });
                        return m;
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, apiUrl, postId]);

    const handleSend = async () => {
        if (!text.trim()) return;
        try {
            setSending(true);
            const body = { user: user?.id, postId, text };
            const res = await fetch(`${apiUrl}/api/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Failed to create comment");
            const { comment }: { comment: CommentDoc } = await res.json();
            // Ajout optimiste en haut de la liste
            setComments((prev) => [comment, ...prev]);
            setText("");
            textareaRef.current?.focus();
            onAdded?.();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    };

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
                    <div className="fixed inset-0 bg-black/30" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto flex items-end justify-center">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="translate-y-full"
                        enterTo="translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="translate-y-0"
                        leaveTo="translate-y-full"
                    >
                        <DialogPanel className="relative w-full max-w-[450px] h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
                            {/* Header */}
                            <div className="mx-auto mt-2 mb-4 w-12 h-1.5 bg-gray-300 rounded-full" />
                            {/* Bouton fermer */}
                            <div className="flex justify-between items-center mb-4 mx-4">
                                <h2 className="text-lg font-semibold font-outfit">Commentaires</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-800"
                                    onClick={() => onClose()}
                                >
                                    Fermer
                                </button>
                            </div>
                            
                            {/* Liste */}
                            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-32">
                                {loading && (
                                    <Skeleton className="w-full h-20 bg-gray-200 rounded" />
                                )}
                                {!loading && comments.length === 0 && (
                                    <p className="text-gray-500 text-center mt-4">Aucun commentaire pour le moment.</p>
                                )}
                                {!loading &&
                                    comments.map((c) => {
                                        const info = usersMap[c.user];
                                        return (
                                            <div key={c._id} className="flex items-start gap-3">
                                                <Avatar
                                                    clickable={true}
                                                    href={`/profil/${c.user}`}
                                                    src={info?.profile_picture_url || undefined}
                                                    alt={info?.pseudo ? info.pseudo.charAt(0).toUpperCase() : "?"}
                                                    size="md"
                                                    isFollowed={true}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium mb-0.5">{info?.pseudo ?? c.user}</p>
                                                    <p className="text-sm text-gray-800">{c.text}</p>
                                                    <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                            {/* Input */}
                            <div className="p-4 border-t flex gap-2 bg-white sticky bottom-0">
                                <Textarea
                                    ref={textareaRef}
                                    placeholder="Ajouter un commentaire…"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <Button disabled={sending || !text.trim()} onClick={handleSend} className="max-w-[120px]">
                                    Envoyer
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
