import type {
  SessionData,
  SessionManager,
  StrategyType,
} from "@cadence/api/auth/session";
import {
  type AuthStrategy,
  ApiKeyAuthStrategy,
  BasicAuthStrategy,
  TokenAuthStrategy,
} from "@cadence/api/auth/strategy";

interface AuthStrategyConstructor {
  new (
    user: string,
    secret: string,
    sessionManager?: SessionManager,
  ): AuthStrategy;
  fromSession(
    session: SessionData,
    sessionManager?: SessionManager,
  ): AuthStrategy;
}

const strategies: Record<StrategyType, AuthStrategyConstructor> = {
  token: TokenAuthStrategy,
  basic: BasicAuthStrategy,
  apikey: ApiKeyAuthStrategy,
};

function getStrategy<T extends keyof typeof strategies>(
  type: T | string,
): AuthStrategyConstructor {
  const Strategy = strategies[type as T];
  if (!Strategy) throw new Error(`Unknown strategy type: ${type}`);
  return Strategy;
}

export const restoreAuthStrategy = (
  session: SessionData,
  sessionManager?: SessionManager,
) => getStrategy(session.type).fromSession(session, sessionManager);
