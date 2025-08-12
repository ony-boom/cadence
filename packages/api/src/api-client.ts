import { buildAuthParams } from "./auth";
import { safeFetch } from "@cadence/lib/http";
import { ApiClientOptions, ApiContract } from "./api-client.type";

export class ApiClient implements ApiContract {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor(opts: ApiClientOptions) {
    this.baseUrl = opts.url.replace(/\/$/, "");
    this.username = opts.user;
    this.password = opts.password;
  }

  private getApiUrl(path: string) {
    const params = new URLSearchParams(
      buildAuthParams(this.username, this.password),
    ).toString();
    return `${this.baseUrl}/rest/${path}?${params}`;
  }

  ping = () => {
    const r = safeFetch(this.getApiUrl("ping.view"));
    r.match(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      },
    );
  };
}
