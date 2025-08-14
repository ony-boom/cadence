import { GlobalLayout } from "./layout";
import { AuthProvider } from "@cadence/lib/context";
import { useSession } from "../hooks/use-session.ts";
import type { SessionManager } from "@cadence/api/auth/session";

function App() {
  const { session, loading } = useSession();

  if (loading) {
    return <p>Loading session ...</p>;
  }
  return (
    <AuthProvider sessionManager={session as SessionManager | undefined}>
      <GlobalLayout />
    </AuthProvider>
  );
}

export default App;
