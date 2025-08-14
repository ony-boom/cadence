import { ApiClient } from "@cadence/api";
import { restoreAuthStrategy, createAuthStrategy } from "./auth-strategy";
import type { SessionManager, StrategyType } from "@cadence/api/auth/session";

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

export function performLogin(
  sessionManager: SessionManager,
  url: string,
  type: StrategyType,
  user: string,
  secret: string,
): ApiClient | null {
  const strategy = createAuthStrategy(type, user, secret, sessionManager);

  sessionManager.save({
    type,
    user,
    data: { ...strategy.buildAuthParams(), baseUrl: url },
  });

  return createApiFromSession(sessionManager);
}
