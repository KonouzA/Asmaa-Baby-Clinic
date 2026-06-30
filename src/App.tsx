import { HashRouter, Routes, Route, Navigate } from "react-router"
import { useSidecar } from "./hooks/use-sidecar"
import { LoginPage } from "./pages/login/login-page"
import { ProtectedRoute } from "./components/protected-route"
import { useAuth, useLogout } from "./features/auth"
import { Button } from "./components/ui/button"

function HomePage() {
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <main className="container mx-auto p-8">
      <header className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Signed in as {user?.displayName}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Log out
        </Button>
      </header>
    </main>
  )
}

function App() {
  useSidecar()

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
