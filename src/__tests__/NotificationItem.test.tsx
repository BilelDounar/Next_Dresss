/* eslint-disable @next/next/no-img-element */
import React, { type ImgHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationItem from '@/components/notifications/NotificationItem';

// Mock Next.js <Image /> component
vi.mock('next/image', () => {
    return {
        default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
            // eslint-disable-next-line jsx-a11y/alt-text
            return <img {...props} />;
        },
    };
});

// Mock custom Avatar component to keep test lightweight
vi.mock('@/components/atom/avatar', () => {
    return {
        default: ({ alt }: { alt: string }) => <div data-testid="avatar">{alt}</div>,
    };
});

// Minimal notification type for tests to avoid `any`
interface Notification {
    _id: string;
    user: string;
    from: string;
    kind: string;
    text: string;
    targetId: string | null;
    targetType: string | null;
    seen: boolean;
    createdAt: string;
}

describe('NotificationItem', () => {
    it('affiche le pseudo et le message de follow', () => {
        const fakeNotification: Notification = {
            _id: '1',
            user: 'u1',
            from: 'u2',
            kind: 'follow',
            text: '',
            targetId: null,
            targetType: null,
            seen: false,
            createdAt: new Date().toISOString(),
        };

        const actors = {
            u2: 'Alice',
        } as Record<string, string>;

        render(<NotificationItem notification={fakeNotification} actors={actors} />);

        expect(screen.getByText('@Alice')).toBeInTheDocument();
        expect(screen.getByText(/a commencé à vous suivre/)).toBeInTheDocument();
    });
});
