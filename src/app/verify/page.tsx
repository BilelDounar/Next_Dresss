'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/atom/button';

interface UserSession {
    id: string;
    email: string;
    status: 'pending' | 'active';
    email_verified: boolean;
}

export default function VerifyPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    router.push('/login');
                    return;
                }
                const data: UserSession = await res.json();
                setUser(data);

                if (data.email_verified) {
                    // Mettre à jour le contexte utilisateur pour éviter la boucle home/verify
                    if (refreshUser) {
                        await refreshUser();
                    }
                    router.push('/home');
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserStatus();
    }, [router]);

    const handleResendEmail = async () => {
        setResendStatus('sending');
        setError(null);
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to resend email.');
            }

            setResendStatus('sent');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Une erreur inconnue est survenue.');
            }
            setResendStatus('error');
        }
    };

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                {/* Vous pouvez mettre un composant Spinner ici */}
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-gray-800">Vérifiez votre adresse e-mail</h1>
                <p className="text-gray-600">
                    Votre compte a été créé avec succès ! Pour finaliser votre inscription, veuillez cliquer sur le lien de vérification que nous avons envoyé à votre adresse e-mail <span className="font-semibold">{user.email}</span>.
                </p>
                <p className="text-sm text-gray-500">
                    (Pensez à vérifier votre dossier de courrier indésirable ou spam)
                </p>
                <div className="pt-4">
                    <Button
                        onClick={handleResendEmail}
                        disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                        className="w-full"
                    >
                        {resendStatus === 'sending' && 'Envoi en cours...'}
                        {resendStatus === 'sent' && 'E-mail renvoyé !'}
                        {resendStatus === 'idle' && 'Renvoyer l\'e-mail de vérification'}
                        {resendStatus === 'error' && 'Réessayer'}
                    </Button>
                </div>
                {resendStatus === 'error' && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {resendStatus === 'sent' && <p className="mt-2 text-sm text-green-600">Un nouvel e-mail a été envoyé. Veuillez vérifier votre boîte de réception.</p>}
            </div>
        </main>
    );
}
