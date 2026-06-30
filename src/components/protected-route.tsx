import { Navigate } from "react-router"
import { useAuth } from "@/features/auth"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <img
          src="/logo.webp"
          alt="Asmaa Baby Clinic"
          className="w-32 animate-pulse md:w-40"
        />
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
