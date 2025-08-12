import { CLIENT_NAME, SUBSONIC_API_VERSION } from "../../constant";

export abstract class AuthStrategy {
  protected baseParams = {
    c: CLIENT_NAME,
    v: SUBSONIC_API_VERSION,
    f: "json",
  };

  abstract buildAuthParams(): Record<string, string>;
}
