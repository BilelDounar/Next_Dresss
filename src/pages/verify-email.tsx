import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const VerifyPage = () => {
    const router = useRouter();
    const { token } = router.query;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Vérification de votre e-mail en cours...');
    const [showResend, setShowResend] = useState(false);
    const [emailForResend, setEmailForResend] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Aucun token de vérification fourni.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    setStatus('error');
                    setMessage(data.message || data.error || 'Une erreur est survenue.');
                    // Si le token a expiré, on affiche le formulaire pour renvoyer l'email
                    if (res.status === 410) {
                        setShowResend(true);
                    }
                } else {
                    setStatus('success');
                    setMessage(data.message);
                }
            } catch {
                setStatus('error');
                setMessage('Impossible de contacter le serveur. Veuillez réessayer plus tard.');
            }
        };

        verifyToken();
    }, [token, router]);

    const handleResendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailForResend) {
            setMessage('Veuillez entrer votre adresse e-mail.');
            return;
        }

        setStatus('loading');
        setMessage('Envoi du nouvel e-mail en cours...');

        try {
            const res = await fetch('/api/auth/verify/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailForResend }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                setMessage(data.error || 'Une erreur est survenue lors du renvoi de l\'e-mail.');
            } else {
                setStatus('success');
                setShowResend(false); // Cacher le formulaire après succès
                setMessage(data.message);
            }
        } catch {
            setStatus('error');
            setMessage('Impossible de contacter le serveur pour le renvoi.');
        }
    };

    return (
        <div className="container" style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
            <h1>Vérification de l&#39;e-mail</h1>
            <p>{message}</p>

            {status === 'success' && !showResend && (
                <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
                    Aller à la page de connexion
                </Link>
            )}

            {showResend && (
                <form onSubmit={handleResendEmail} style={{ marginTop: '20px' }}>
                    <p>Pour recevoir un nouveau lien, veuillez entrer votre adresse e-mail :</p>
                    <input
                        type="email"
                        value={emailForResend}
                        onChange={(e) => setEmailForResend(e.target.value)}
                        placeholder="votre.email@exemple.com"
                        required
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button type="submit" disabled={status === 'loading'} style={{ padding: '8px 12px' }}>
                        {status === 'loading' ? 'Envoi...' : 'Renvoyer l&#39;e-mail'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default VerifyPage;
