import { Navigate } from "react-router"
import { useAuth } from "@/features/auth"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
