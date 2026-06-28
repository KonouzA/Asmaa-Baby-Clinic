import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUsers, useCreateUser } from '../hooks/use-users';
import { createUserSchema } from '../schemas/users.schema';

export function UsersPanel() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createUserSchema.safeParse({ name, email });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setFormError(null);
    createUser.mutate(parsed.data, {
      onSuccess: () => {
        setName('');
        setEmail('');
      },
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Users</h2>

      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
        <input
          className="rounded-md border px-3 py-1.5 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <input
          className="rounded-md border px-3 py-1.5 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? 'Adding…' : 'Add user'}
        </Button>
      </form>

      {formError && <p className="text-sm text-destructive">{formError}</p>}
      {createUser.error && (
        <p className="text-sm text-destructive">{createUser.error.message}</p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <ul className="flex flex-col gap-1">
        {users?.map((u) => (
          <li key={u.id} className="text-sm">
            {u.name} — <span className="text-muted-foreground">{u.email}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
