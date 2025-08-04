import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Redirects *authenticated* users so they cannot access public/guest pages.
 *
 * Behaviour :
 *   – While auth is loading ⇒ do nothing.
 *   – When a user is present :
 *       • status === 'pending'  → "/about-you" (profil à compléter)
 *       • else                 → "/home"
 *
 * Usage (in a public page):
 *   useRedirectIfAuth();
 */
export const useRedirectIfAuth = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading || !user) return;

        if (user.status === 'pending') {
            router.replace('/about-you');
        } else {
            router.replace('/home');
        }
    }, [loading, user, router]);
};