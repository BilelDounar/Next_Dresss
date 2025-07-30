"use client";
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
    id: string;
    username: string;
    email: string;
    status: 'pending' | 'active' | 'disabled';
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponsePayload {
    user: User;
    token: string;
}

type LoginData = LoginCredentials | LoginResponsePayload;

interface RegisterData {
    email: string;
    password: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        setError(null);

        if (userData.status === 'pending') {
            router.push('/about-you');
        } else {
            router.push('/home');
        }
    };

    const login = async (data: LoginData) => {
        try {
            if ('email' in data) {
                // credentials provided, call backend
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_MONGO}/auth/login`, data);
                const { user, token } = response.data;
                handleAuth(user, token);
            } else if ('user' in data && 'token' in data) {
                // already authenticated payload
                handleAuth(data.user, data.token);
            }
        } catch (err) {
            console.error('Login failed', err);
            setError('Login failed');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_MONGO}/auth/register`, data);
            const { user, token } = response.data;
            handleAuth(user, token);
        } catch (err) {
            console.error('Registration failed', err);
            setError('Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
