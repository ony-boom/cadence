import { ApiClient } from "@cadence/api";
import { restoreAuthStrategy } from "./restore-auth-strategy";
import type { SessionManager, StrategyType } from "@cadence/api/auth/session";
import { AuthStrategy } from "@cadence/api/auth/strategy";

export function createApiFromSession(
  sessionManager: SessionManager,
): ApiClient | null {
  const data = sessionManager.load();
  if (!data?.data?.baseUrl) return null;

  return new ApiClient({
    url: data.data.baseUrl,
    authStrategy: restoreAuthStrategy(data, sessionManager),
    sessionManager,
  });
}

export interface LoginParamsWithSession {
  sessionManager: SessionManager;
  url: string;
  user: string;
  authStrategy: AuthStrategy;
}

export function performLogin({
  sessionManager,
  url,
  user,
  authStrategy,
}: LoginParamsWithSession): ApiClient | null {
  sessionManager.save({
    type: authStrategy.type as StrategyType,
    user,
    data: { ...authStrategy.buildAuthParams(), baseUrl: url },
  });

  return createApiFromSession(sessionManager);
}
