import { AuthStrategy } from "./auth-strategy";

export class ApiKeyAuthStrategy extends AuthStrategy {
  constructor(
    private readonly user: string,
    private readonly apiKey: string,
  ) {
    super();
  }

  buildAuthParams() {
    return {
      ...this.baseParams,
      u: this.user,
      apiKey: this.apiKey,
    };
  }
}
