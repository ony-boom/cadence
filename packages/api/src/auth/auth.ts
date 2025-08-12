import { BasicAuthStrategy } from "./strategy/basic-strategy";
import { TokenAuthStrategy } from "./strategy/token-strategy";
import { AuthStrategy } from "./strategy/auth-strategy";
import { ApiKeyAuthStrategy } from "./strategy/api-key-strategy";

export class Auth {
  static basic(user: string, password: string): AuthStrategy {
    return new BasicAuthStrategy(user, password);
  }

  static withToken(user: string, password: string): AuthStrategy {
    return new TokenAuthStrategy(user, password);
  }

  static withApiKey(user: string, apiKey: string): AuthStrategy {
    return new ApiKeyAuthStrategy(user, apiKey);
  }
}
