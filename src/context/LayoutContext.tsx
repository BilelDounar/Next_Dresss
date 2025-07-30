"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    isNavbarVisible: boolean;
    setNavbarVisible: (isVisible: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [isNavbarVisible, setNavbarVisible] = useState(true);

    return (
        <LayoutContext.Provider value={{ isNavbarVisible, setNavbarVisible }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
