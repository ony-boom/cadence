import { AuthStrategy } from "./auth-strategy";
import type {
  SessionManager,
  SessionData,
  StrategyType,
} from "../session-manager";

export class ApiKeyAuthStrategy extends AuthStrategy {
  readonly type: StrategyType = "apikey";
  constructor(
    private readonly user: string,
    private readonly apiKey: string,
    sessionManager?: SessionManager,
  ) {
    super(sessionManager);
  }

  static fromSession(session: SessionData, sessionManager?: SessionManager) {
    return this.restore("apikey", session, (data) => {
      const { u, apiKey } = data;
      if (!u || !apiKey) {
        throw new Error("Invalid API key session data");
      }
      return new ApiKeyAuthStrategy(u, apiKey, sessionManager);
    });
  }

  buildAuthParams() {
    return this.withSession("apikey", this.user, () => ({
      u: this.user,
      apiKey: this.apiKey,
    }));
  }
}
