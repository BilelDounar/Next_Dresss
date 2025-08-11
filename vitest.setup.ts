import '@testing-library/jest-dom';

// Polyfill IntersectionObserver for tests (used in Slide component)
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
    class MockIntersectionObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
        takeRecords() { return []; }
    }
    // @ts-ignore
    window.IntersectionObserver = MockIntersectionObserver;
    // @ts-ignore
    globalThis.IntersectionObserver = MockIntersectionObserver;
}
