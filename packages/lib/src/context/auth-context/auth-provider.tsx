import { AuthContext } from "./auth-context";
import type { ApiClient } from "@cadence/api";
import { useSession } from "../../hooks/use-session";
import type { StrategyType } from "@cadence/api/auth/session";
import { createApiFromSession, performLogin } from "./auth-utils";
import { useEffect, useState, type ReactNode, useCallback } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ApiClient | null>(null);
  const { session, loading: loadingSession } = useSession();

  const login = useCallback(
    (url: string, type: StrategyType, user: string, secret: string) => {
      if (!session) return;
      setClient(performLogin(session, url, type, user, secret));
    },
    [session],
  );

  const logout = useCallback(() => {
    session?.clear();
    setClient(null);
  }, [session]);

  useEffect(() => {
    if (session) setClient(createApiFromSession(session));
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        client,
        loading: loadingSession || !session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
