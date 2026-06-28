import { useSidecar } from "./hooks/use-sidecar";
import { UsersPanel } from "./features/users";

function App() {
  useSidecar();

  return (
    <main className="container mx-auto p-8">
      <UsersPanel />
    </main>
  );
}

export default App;
