"use client";
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
    id: string;
    username: string;
    email: string;
    status: 'pending' | 'active';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleAuth = (userData: User, userToken: string) => {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);

        if (userData.status === 'pending') {
            router.push('/about-you');
        } else {
            router.push('/home');
        }
    };

    const login = async (data: any) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_MONGO}/auth/login`, data);
            const { user, token } = response.data;
            handleAuth(user, token);
        } catch (error) {
            console.error('Login failed', error);
            // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
        }
    };

    const register = async (data: any) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_MONGO}/auth/register`, data);
            const { user, token } = response.data;
            handleAuth(user, token);
        } catch (error) {
            console.error('Registration failed', error);
            // Gérer l'erreur
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
