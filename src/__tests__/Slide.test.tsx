import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Slide from '@/components/navigation/Slide';

// Mock Next.js Image component to a simple <img>
vi.mock('next/image', () => {
    return {
        __esModule: true,
        default: (props: any) => {
            // eslint-disable-next-line jsx-a11y/alt-text
            return <img {...props} />;
        },
    };
});

// Mock authentication hook
vi.mock('@/hooks/useAuth', () => {
    return {
        useAuth: () => ({
            user: {
                id: 'u1',
                nom: 'Doe',
                prenom: 'John',
                pseudo: 'jdoe',
            },
        }),
    };
});

// Mock save hook
vi.mock('@/hooks/useSave', () => {
    return {
        __esModule: true,
        default: () => ({
            saved: false,
            toggleSave: vi.fn(),
        }),
    };
});

// Mock Avatar to avoid router dependency
vi.mock('@/components/atom/avatar', () => {
    return {
        __esModule: true,
        default: ({ alt }: { alt?: string }) => <div data-testid="avatar">{alt}</div>,
    };
});

// Mock Next.js app router used inside Avatar
vi.mock('next/navigation', () => {
    return {
        useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
    };
});

// Simple global.fetch mock that always succeeds
beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
    }) as unknown as typeof fetch;
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Slide', () => {
    it('render les images de la publication', async () => {
        const publication = {
            _id: 'pub1',
            description: 'Une belle publication',
            user: 'u2',
            urlsPhotos: ['/uploads/photo1.jpg', '/uploads/photo2.jpg'],
            likes: 3,
            comments: 1,
        } as any;

        render(<Slide publication={publication} />);

        await waitFor(() => {
            const images = screen.getAllByRole('img');
            expect(images.length).toBe(publication.urlsPhotos.length);
        });
    });
});
