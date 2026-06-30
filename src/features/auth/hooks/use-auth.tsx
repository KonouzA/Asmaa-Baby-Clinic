import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from "@/lib/api";
import { authApi } from "../api/auth.api";
import type {
  LoginDto,
  LoginResponse,
  SessionUser,
} from "../schemas/auth.schema";

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** A stored token is still being validated against /me (e.g. after reload). */
  isBootstrapping: boolean;
  setSession: (res: LoginResponse) => void;
  clear: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<SessionUser | null>(null);

  const setSession = (res: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const clear = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    qc.clear();
  };

  // Validate a stored token on load. If the sidecar restarted (in-memory
  // sessions are gone), /me returns 401 and the api interceptor fires
  // UNAUTHORIZED_EVENT, dropping us back to the login screen.
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: !!token && !user,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data);
  }, [meQuery.data]);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);
  const isBootstrapping = !!token && !user && !meQuery.isError;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isBootstrapping,
        setSession,
        clear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function useLogin() {
  const { setSession } = useAuth();
  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: setSession,
  });
}

export function useLogout() {
  const { clear } = useAuth();
  return useMutation({
    mutationFn: () => authApi.logout(),
    // Clear local session whether or not the server call succeeds.
    onSettled: clear,
  });
}
