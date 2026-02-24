import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axiosClient';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get<User>('/user');
            setUser(response.data);
        } catch {
            localStorage.removeItem('ACCESS_TOKEN');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string): Promise<void> => {
        const response = await api.post<{ user: User; token: string }>('/login', { email, password });
        localStorage.setItem('ACCESS_TOKEN', response.data.token);
        setUser(response.data.user);
    };

    const logout = async (): Promise<void> => {
        try {
            await api.post('/logout');
        } catch {
            // Ignore errors
        } finally {
            localStorage.removeItem('ACCESS_TOKEN');
            setUser(null);
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        passwordConfirmation: string
    ): Promise<void> => {
        await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
