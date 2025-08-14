import type { ApiClient } from "@cadence/api";
import { createContext } from "react";
import { AuthStrategy } from "@cadence/api/auth/strategy";

export interface AuthContextValue {
  client: ApiClient | null;
  sessionActive: boolean;
  login: (loginParams: LoginParams) => void;
  logout: () => void;
}

export interface LoginParams {
  url: string;
  user: string;
  authStrategy: AuthStrategy;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
