import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import type { User, LoginResponse } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export function useAuth() {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: !!localStorage.getItem('ACCESS_TOKEN'),
        isLoading: true,
    });

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            const response = await api.get<User>('/user');
            setAuthState({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            localStorage.removeItem('ACCESS_TOKEN');
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string): Promise<void> => {
        const response = await api.post<LoginResponse>('/login', { email, password });
        localStorage.setItem('ACCESS_TOKEN', response.data.token);
        setAuthState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
        });
        navigate('/teacher/dashboard');
    };

    const logout = async (): Promise<void> => {
        try {
            await api.post('/logout');
        } catch {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('ACCESS_TOKEN');
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            navigate('/login');
        }
    };

    const register = async (name: string, email: string, password: string, passwordConfirmation: string): Promise<void> => {
        await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });
        navigate('/login');
    };

    return {
        ...authState,
        login,
        logout,
        register,
        refreshUser: fetchUser,
    };
}
