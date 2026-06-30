import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth";
import { loginSchema } from "@/features/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const parsed = loginSchema.safeParse({ username, password });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed.success) return;
    login.mutate(parsed.data);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {login.isError && (
          <p className="text-sm text-destructive text-center">
            {login.error.message}
          </p>
        )}
        <Field>
          <Button type="submit" disabled={!parsed.success || login.isPending}>
            {login.isPending ? "Signing in…" : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
