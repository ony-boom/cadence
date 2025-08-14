import type { ApiClient } from "@cadence/api";
import { createContext } from "react";

export interface AuthContextValue {
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
