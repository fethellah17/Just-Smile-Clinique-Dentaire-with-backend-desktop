import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "./api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "just-smile-session-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount - check SessionStorage only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionToken = sessionStorage.getItem(SESSION_KEY);
      setIsAuthenticated(sessionToken === "authenticated");
    }
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success) {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(SESSION_KEY, "authenticated");
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
