import type { ApiClient } from "@cadence/api";
import { createContext, useContext } from "react";

interface AuthContextValue {
  client: ApiClient | null;
  loading: boolean;
  login: (
    url: string,
    type: "token" | "basic" | "apikey",
    user: string,
    secret: string,
  ) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context as AuthContextValue;
};
