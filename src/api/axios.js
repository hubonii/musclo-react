// Axios API module with shared client instance and request helpers.
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// Use local backend by default if no env override is provided.
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 401 handler: resets auth store and redirects to login routes.
            useAuthStore.getState().reset();
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 419) {
            // Refresh CSRF cookie once, then retry the failed request.
            return getCsrfCookie().then(() => {
                return apiClient(error.config);
            });
        }

        if (error.response && error.response.status >= 500) {
            console.error(`Critical API failure [${error.response.status}]:`, error.response.data);
        }

        return Promise.reject(error);
    }
);

// Needed before state-changing requests when CSRF cookie is missing/expired.
export const getCsrfCookie = () => axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });

export async function apiGet(url, params) {
    const { data } = await apiClient.get(url, { params });
    return data.data ?? null;
}

export async function apiPost(url, body, config) {
    const { data } = await apiClient.post(url, body, config);
    return data.data ?? null;
}

export async function apiPut(url, body) {
    const { data } = await apiClient.put(url, body);
    return data.data ?? null;
}

export async function apiDelete(url) {
    await apiClient.delete(url);
}

// Convert backend 422 validation errors into a predictable object for forms.
export function getValidationErrors(error) {
    if (
        axios.isAxiosError(error) &&
        error.response?.status === 422 &&
        error.response?.data?.errors
    ) {
        return error.response.data;
    }

    return null;
}
