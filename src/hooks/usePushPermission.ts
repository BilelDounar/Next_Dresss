// Hook to request browser push permission
import { useState, useEffect } from 'react';

/**
 * usePushPermission — ask the user for `Notification` permission once `trigger` is true.
 * It returns the current permission status (granted | denied | default).
 */
export function usePushPermission(trigger: boolean) {
    const [status, setStatus] = useState<NotificationPermission>(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
        return Notification.permission;
    });

    useEffect(() => {
        if (!trigger) return;
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission !== 'default') {
            setStatus(Notification.permission);
            return;
        }

        Notification.requestPermission().then(setStatus);
    }, [trigger]);

    return status;
}
