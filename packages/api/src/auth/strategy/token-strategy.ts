import SparkMD5 from "spark-md5";
import { AuthStrategy } from "./auth-strategy";

export class TokenAuthStrategy extends AuthStrategy {
  constructor(
    private readonly user: string,
    private readonly password: string,
  ) {
    super();
  }

  generateSalt(length = 6): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  buildAuthParams() {
    const salt = this.generateSalt();
    const token = SparkMD5.hash(this.password + salt);

    return {
      ...this.baseParams,
      u: this.user,
      t: token,
      s: salt,
    };
  }
}
