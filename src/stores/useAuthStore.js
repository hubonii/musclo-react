// Global auth store (session state + auth actions).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, apiGet, getCsrfCookie } from '../api/axios';

export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthenticating: false,
    isInitializing: false,

    login: async (email, password) => {
        set({ isAuthenticating: true });
        try {
            await getCsrfCookie();
            const { data } = await apiClient.post('/login', { email, password });
            set({ user: data.user, isAuthenticated: true });
        } finally {
            set({ isAuthenticating: false });
        }
    },

    register: async (name, email, password, password_confirmation) => {
        set({ isAuthenticating: true });
        try {
            await getCsrfCookie();
            const { data } = await apiClient.post('/register', { name, email, password, password_confirmation });
            set({ user: data.user, isAuthenticated: true });
        } finally {
            set({ isAuthenticating: false });
        }
    },

    logout: async () => {
        try {
            await getCsrfCookie();
            await apiClient.post('/logout');
        } catch {
            // Even if backend logout fails, clear local session state.
        }
        set({ user: null, isAuthenticated: false });
    },

    // Called on app startup to restore a valid server session.
    fetchUser: async () => {
        if (get().isInitializing) return;

        set({ isInitializing: true });
        try {
            const user = await apiGet('/user');
            set({ user, isAuthenticated: true });
        } catch {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isInitializing: false });
        }
    },

    reset: () => set({ user: null, isAuthenticated: false }),
}), {
    name: 'musclo-auth',
    partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
    })
}));
