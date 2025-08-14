import { CLIENT_NAME, SUBSONIC_API_VERSION } from "../../constant";
import type {
  SessionManager,
  SessionData,
  StrategyType,
} from "../session-manager";

export abstract class AuthStrategy {
  abstract readonly type: StrategyType;
  protected baseParams = {
    c: CLIENT_NAME,
    v: SUBSONIC_API_VERSION,
    f: "json",
  };

  protected constructor(protected sessionManager?: SessionManager) {}

  abstract buildAuthParams(): Record<string, string>;

  protected loadSession(): SessionData | null {
    return this.sessionManager?.load() ?? null;
  }

  protected saveSession(session: SessionData) {
    this.sessionManager?.save(session);
  }

  protected withSession(
    type: SessionData["type"],
    user: string,
    compute: () => Record<string, string>,
  ): Record<string, string> {
    const session = this.loadSession();
    if (session && session.type === type && session.user === user) {
      return { ...this.baseParams, ...session.data };
    }

    const data = compute();
    this.saveSession({ user, type, data });

    return { ...this.baseParams, ...data };
  }

  protected static restore<T extends AuthStrategy>(
    this: new (...args: any[]) => T,
    expectedType: string,
    session: SessionData,
    factory: (data: Record<string, string>) => T,
  ): T {
    if (session.type !== expectedType) {
      throw new Error(
        `Invalid session type for ${expectedType}: ${session.type}`,
      );
    }
    return factory(session.data);
  }
}
