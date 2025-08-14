import SparkMD5 from "spark-md5";
import { AuthStrategy } from "./auth-strategy";
import type { SessionManager, SessionData } from "../session-manager";

export class TokenAuthStrategy extends AuthStrategy {
  private readonly password?: string;
  private readonly precomputed?: { token: string; salt: string };

  constructor(
    private readonly user: string,
    passwordOrOpts: string | { token: string; salt: string },
    sessionManager?: SessionManager,
  ) {
    super(sessionManager);
    if (typeof passwordOrOpts === "string") {
      this.password = passwordOrOpts;
    } else {
      this.precomputed = passwordOrOpts;
    }
  }

  static fromPrecomputed(
    user: string,
    token: string,
    salt: string,
    sessionManager?: SessionManager,
  ) {
    return new TokenAuthStrategy(user, { token, salt }, sessionManager);
  }

  static fromSession(session: SessionData, sessionManager?: SessionManager) {
    return this.restore("token", session, sessionManager, (data) => {
      const { u, t, s } = data;
      if (!u || !t || !s) {
        throw new Error("Invalid token session data");
      }
      return new TokenAuthStrategy(u, { token: t, salt: s }, sessionManager);
    });
  }

  private generateSalt(length = 6): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  buildAuthParams() {
    return this.withSession("token", this.user, () => {
      if (this.precomputed) {
        return {
          u: this.user,
          t: this.precomputed.token,
          s: this.precomputed.salt,
        };
      }
      const s = this.generateSalt();
      const t = SparkMD5.hash((this.password ?? "") + s);
      return { u: this.user, t, s };
    });
  }
}
