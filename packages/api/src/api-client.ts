import { AuthStrategy } from "./auth/strategy/auth-strategy";

interface ApiClientOptions {
  url: string;
  authStrategy: AuthStrategy;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly authStrategy: AuthStrategy;

  constructor(opts: ApiClientOptions) {
    this.baseUrl = opts.url.replace(/\/$/, "");
    this.authStrategy = opts.authStrategy;
  }

  private getApiUrl(path: string): string {
    const authParams = this.authStrategy.buildAuthParams();
    const params = new URLSearchParams(authParams).toString();

    const url = new URL(`rest/${path}`, this.baseUrl);
    url.search = params;

    return url.toString();
  }
}
