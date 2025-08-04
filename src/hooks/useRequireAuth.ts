import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Client-side guard hook to ensure a route is only accessible
 * when the user is authenticated.  While the authentication
 * status is still loading we do nothing to avoid flicker.  As
 * soon as we know the user is not logged-in we redirect them
 * to the public welcome page.
 *
 * Usage:
 *   const { user, loading } = useRequireAuth();
 *
 * The hook simply re-exports the values returned by `useAuth`
 * so existing pages can swap **useAuth → useRequireAuth** with
 * minimal changes.
 */
export const useRequireAuth = () => {
    const auth = useAuth();
    const { user, loading } = auth;
    const router = useRouter();

    useEffect(() => {
        // When auth finished loading and there is no user, bounce.
        if (!loading && !user) {
            // `replace` prevents the protected page from being kept in history.
            router.replace('/welcome');
        }
    }, [loading, user, router]);

    return auth;
};