import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth";
import { LoginForm } from "@/components/login-form";

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        {/* On small screens the side panel is hidden, so show the pattern
            behind the form card instead of a blank background. */}
        <img
          src="/pattern.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover lg:hidden"
        />
        <div className="relative flex flex-1 items-center justify-center">
          <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg">
            <img
              src="/text-logo.webp"
              alt="Asmaa Baby Clinic"
              className="size-6 object-contain align-center mx-auto mb-4 h-40 w-40 rounded-full"
            />
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/pattern.png"
          alt="Asmaa Baby Clinic"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
