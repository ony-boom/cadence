import { useAuthContext } from "@cadence/lib/hooks";
import { TokenAuthStrategy } from "@cadence/api/auth/strategy";

export function GlobalLayout() {
  const { sessionActive, client, login } = useAuthContext();

  if (!client || !sessionActive) {
    return (
      <p>
        You are not authenticated.
        <button
          onClick={() => {
            login({
              url: "http://localhost:4747",
              user: "ony",
              authStrategy: new TokenAuthStrategy("ony", "ony@gonic20370256"),
            });
            // window.location.reload();
          }}
        >
          Login
        </button>
      </p>
    );
  }

  client?.ping();

  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
