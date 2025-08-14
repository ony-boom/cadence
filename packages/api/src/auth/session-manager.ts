export type StrategyType = "token" | "basic" | "apikey";

export interface SessionData {
  user: string;
  type: StrategyType;
  data: Record<string, string>;
}

export interface SessionManager {
  save(session: SessionData): void;
  load(): SessionData | null;
  clear(): void;
}
