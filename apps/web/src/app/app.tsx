import { GlobalLayout } from "./layout";
import { AuthProvider } from "@cadence/lib/context";

function App() {
  return (
    <AuthProvider>
      <GlobalLayout />
    </AuthProvider>
  );
}

export default App;
