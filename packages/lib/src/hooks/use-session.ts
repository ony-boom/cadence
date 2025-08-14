import { useCallback, useEffect, useState } from "react";
import { IndexDBSessionManager } from "../../../../apps/web/src/lib/session-manager.ts";

export function useSession() {
  const [savedSession, setSavedSession] =
    useState<IndexDBSessionManager | null>(null);
  const [loading, setLoading] = useState(true);

  const initSession = useCallback(async () => {
    const mgr = await IndexDBSessionManager.create();
    setSavedSession(mgr);
    setLoading(false);
  }, []);

  useEffect(() => {
    void initSession();
  }, [initSession]);

  return { session: savedSession, loading };
}
