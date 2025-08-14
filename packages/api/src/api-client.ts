import { AuthStrategy } from "./auth/strategy/auth-strategy";
import type { SessionManager } from "./auth/session-manager";

export interface ApiClientOptions {
  url: string;
  authStrategy: AuthStrategy;
  sessionManager?: SessionManager;
}

export class ApiClient {
  readonly baseUrl: string;
  readonly auth: AuthStrategy;
  readonly sessionManager?: SessionManager;

  constructor({ url, authStrategy, sessionManager }: ApiClientOptions) {
    this.baseUrl = url.replace(/\/$/, "");
    this.auth = authStrategy;
    this.sessionManager = sessionManager;
  }

  private getApiUrl(path: string): string {
    const authParams = this.auth.buildAuthParams();
    const params = new URLSearchParams(authParams).toString();

    const url = new URL(`rest/${path}`, this.baseUrl);
    url.search = params;

    return url.toString();
  }

  ping = async () => {
    const url = this.getApiUrl("ping");
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);
    return data;
  };
}
