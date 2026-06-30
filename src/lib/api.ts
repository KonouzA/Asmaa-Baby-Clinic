import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'auth_token';
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

const http = axios.create({ baseURL: 'http://localhost:3000' });

// Attach the bearer token (if any) to every request.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the response body, and normalize errors to `Error(message)`.
// A 401 clears the stored token and notifies the app to fall back to login.
http.interceptors.response.use(
  (res) => res.data,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const message =
      error.response?.data?.error ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  },
);

// Response interceptor already returns `res.data`, so each method resolves to T.
export const api = {
  get: <T>(path: string) => http.get(path) as Promise<T>,
  post: <T>(path: string, body?: unknown) => http.post(path, body) as Promise<T>,
  put: <T>(path: string, body?: unknown) => http.put(path, body) as Promise<T>,
  delete: <T>(path: string) => http.delete(path) as Promise<T>,
};
