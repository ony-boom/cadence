import { AuthStrategy } from "./auth-strategy";

export class BasicAuthStrategy extends AuthStrategy {
  constructor(
    private readonly user: string,
    private readonly password: string,
  ) {
    super();
  }

  buildAuthParams() {
    return {
      ...this.baseParams,
      u: this.user,
      p: this.password,
    };
  }
}
