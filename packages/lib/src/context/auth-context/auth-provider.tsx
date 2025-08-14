import { AuthContext } from "./auth-context";
import type { ApiClient } from "@cadence/api";
import type { SessionManager, StrategyType } from "@cadence/api/auth/session";
import { createApiFromSession, performLogin } from "./auth-utils";
import { useEffect, useState, type ReactNode, useCallback } from "react";

export function AuthProvider({
  children,
  sessionManager,
}: {
  children: ReactNode;
  sessionManager?: SessionManager;
}) {
  const [client, setClient] = useState<ApiClient | null>(null);

  const login = useCallback(
    (url: string, type: StrategyType, user: string, secret: string) => {
      if (!sessionManager) return;
      setClient(performLogin(sessionManager, url, type, user, secret));
    },
    [sessionManager],
  );

  const logout = useCallback(() => {
    sessionManager?.clear();
    setClient(null);
  }, [sessionManager]);

  useEffect(() => {
    if (sessionManager) setClient(createApiFromSession(sessionManager));
  }, [sessionManager]);

  return (
    <AuthContext.Provider
      value={{
        client,
        login,
        logout,
        sessionActive: !!sessionManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
