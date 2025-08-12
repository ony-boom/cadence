import { err, ResultAsync } from "neverthrow";

export type FetchError<E> = NetworkError | HttpError<E> | ParseError;

export enum FetchErrorType {
  Network = "network",
  Http = "http",
  Parse = "parse",
}

export interface NetworkError {
  type: FetchErrorType.Network;
  error: Error;
}

export interface HttpError<E = unknown> {
  type: FetchErrorType.Http;
  status: number;
  headers: Headers;
  json?: E;
}

export interface ParseError {
  type: FetchErrorType.Parse;
  error: Error;
}

export function safeFetch<T = unknown, E = unknown>(
  input: URL | string,
  init?: RequestInit,
): ResultAsync<T, FetchError<E>> {
  return ResultAsync.fromPromise(
    fetch(input, init),
    (error): NetworkError => ({
      type: FetchErrorType.Network,
      error: error instanceof Error ? error : new Error(String(error)),
    }),
  ).andThen((response) => {
    if (!response.ok) {
      return ResultAsync.fromPromise(
        response.json().catch(() => ({}) as E),
        () =>
          ({
            type: FetchErrorType.Parse,
            error: new Error("Failed to parse error response JSON"),
          }) as ParseError,
      ).andThen((json) => {
        return err({
          type: FetchErrorType.Http,
          status: response.status,
          headers: response.headers,
          json: json as E,
        } as HttpError<E>);
      });
    }

    return ResultAsync.fromPromise(
      response.json() as Promise<T>,
      (error): ParseError => ({
        type: FetchErrorType.Parse,
        error: error instanceof Error ? error : new Error(String(error)),
      }),
    );
  });
}
