// Global auth store (session state + auth actions).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, apiGet, apiPost } from '../api/axios';

export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthenticating: false,
    isInitializing: false,

    login: async (email, password) => {
        set({ isAuthenticating: true });
        try {
            // Node.js does not need getCsrfCookie()
            const responseData = await apiPost('/login', { email, password });

            // Adjusting to match Node.js response structure
            const userData = responseData.user || responseData;
            const token = responseData.token;
            if (token) localStorage.setItem('musclo-token', token);
            set({ user: userData, isAuthenticated: true });
        } finally {
            set({ isAuthenticating: false });
        }
    },

    register: async (name, email, password, password_confirmation) => {
        set({ isAuthenticating: true });
        try {
            // Node.js does not need getCsrfCookie()
            const responseData = await apiPost('/register', { name, email, password, password_confirmation });

            const userData = responseData.user || responseData;
            const token = responseData.token;
            if (token) localStorage.setItem('musclo-token', token);
            set({ user: userData, isAuthenticated: true });
        } finally {
            set({ isAuthenticating: false });
        }
    },

    logout: async () => {
        try {
            // Directly hit the logout endpoint
            await apiClient.post('/logout');
        } catch {
            // Even if backend logout fails (e.g. session expired), clear local state
        }
        set({ user: null, isAuthenticated: false });
        // Optional: clear local storage if persist doesn't clear fully
        localStorage.removeItem('musclo-auth');
        localStorage.removeItem('musclo-token');
    },

    // Called on app startup to restore a valid server session.
    fetchUser: async () => {
        if (get().isInitializing) return;

        set({ isInitializing: true });
        try {
            //apiGet helper already handles the data extraction
            const user = await apiGet('/user');
            set({ user, isAuthenticated: !!user });
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