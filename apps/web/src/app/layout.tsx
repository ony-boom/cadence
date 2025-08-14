import { useAuthContext } from "@cadence/lib/hooks";

export function GlobalLayout() {
  const { sessionActive, client, login } = useAuthContext();

  if (!client || !sessionActive) {
    return (
      <p>
        You are not authenticated.
        <button
          onClick={() => {
            login("http://localhost:4747", "token", "ony", "ony@gonic20370256");
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
