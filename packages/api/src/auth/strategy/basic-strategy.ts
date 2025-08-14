import { AuthStrategy } from "./auth-strategy";
import type { SessionManager, SessionData } from "../session-manager";

export class BasicAuthStrategy extends AuthStrategy {
  constructor(
    private readonly user: string,
    private readonly password: string,
    sessionManager?: SessionManager,
  ) {
    super(sessionManager);
  }

  static fromSession(session: SessionData, sessionManager?: SessionManager) {
    return this.restore("basic", session, sessionManager, (data) => {
      const { u, p } = data;
      if (!u || !p) {
        throw new Error("Invalid basic session data");
      }
      return new BasicAuthStrategy(u, p, sessionManager);
    });
  }

  buildAuthParams() {
    return this.withSession("basic", this.user, () => ({
      u: this.user,
      p: this.password,
    }));
  }
}
