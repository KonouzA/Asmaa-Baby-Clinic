# Tauri Desktop App — Project Scaffold Reference

## Tech Stack

### Frontend
- React + TypeScript
- Shadcn (component library)
- Tanstack Query (server state)
- Tailwind CSS
- Zod (validation)
- Bun (package manager + runtime)

### Backend (Sidecar)
- Bun (runtime)
- Hono (HTTP framework)
- SQLite (via `bun:sqlite`)
- Zod (validation)

### Desktop
- Tauri v2

---

## Prerequisites

- **Bun** — package manager + runtime.
- **Rust toolchain** (`rustc` + `cargo`) — **required by Tauri** to compile and run the
  desktop shell (`tauri:dev` / `tauri:build`). Install via <https://rustup.rs>. The
  frontend and the sidecar run without it, but the Tauri app will not build.
  On Windows the default `x86_64-pc-windows-msvc` toolchain also needs the
  **MSVC Build Tools** (C++ build tools).
- **Tauri system deps** per your OS — see <https://tauri.app/start/prerequisites/>.

## Initial Setup

### 1. Scaffold the Tauri app

```bash
bunx create-tauri-app@latest
# Choose: React, TypeScript, Bun
cd your-app
bun install
```

### 2. Frontend dependencies

```bash
# Tailwind
bun add -d tailwindcss @tailwindcss/vite

# Shadcn
bunx shadcn@latest init

# Tanstack Query
bun add @tanstack/react-query @tanstack/react-query-devtools

# Zod
bun add zod

# Tauri shell plugin (JS side) — used to spawn the compiled sidecar
bun add @tauri-apps/plugin-shell
```

> The shell plugin also needs its **Rust** crate. In `src-tauri/Cargo.toml` add
> `tauri-plugin-shell = "2"`, and register it in `src-tauri/src/lib.rs`:
> `.plugin(tauri_plugin_shell::init())`.

### 3. Backend (sidecar) dependencies

```bash
mkdir -p src-tauri/sidecar
cd src-tauri/sidecar
bun init -y
bun add hono @hono/zod-validator zod
# bun:sqlite is built into Bun, no install needed
cd ../..
```

---

## Project Structure

> **Note on this repo's layout.** The actual app lives one level down, at
> `ABC/ABC/` (the outer `ABC/` only holds this doc and a stray `package.json`).
> All paths below are relative to the **app root** = `ABC/ABC/`.

```
ABC/ABC/                                  # App root (the inner ABC)
│
├── src/                                  # Frontend (React)
│   ├── main.tsx                          # Wraps <App/> in <Providers>
│   ├── App.tsx                           # Calls useSidecar(); renders features
│   │
│   ├── components/
│   │   └── ui/                           # Shadcn components (auto-generated)
│   │
│   ├── lib/
│   │   ├── api.ts                        # Central fetch wrapper
│   │   └── utils.ts                      # Shadcn utils (auto-generated)
│   │
│   ├── hooks/
│   │   └── use-sidecar.ts                # Spawn/manage sidecar process
│   │
│   ├── providers/
│   │   └── index.tsx                     # QueryClient + devtools
│   │
│   └── features/                         # Feature folders
│       └── [feature]/
│           ├── components/               # React components
│           ├── hooks/                    # Tanstack Query hooks
│           ├── api/                      # Fetch calls for this feature
│           ├── schemas/                  # Zod schemas + TS types
│           └── index.ts                  # Barrel export
│
├── scripts/
│   └── build-sidecar.ts                  # Compiles sidecar w/ target-triple name
│
├── src-tauri/
│   ├── sidecar/                          # Bun backend
│   │   ├── index.ts                      # Entry point (Hono server)
│   │   ├── db/
│   │   │   ├── index.ts                  # SQLite connection + migration runner
│   │   │   ├── migrations.ts             # Ordered registry (text-imports the .sql)
│   │   │   └── migrations/
│   │   │       └── 001_init.sql
│   │   ├── middleware/
│   │   │   └── error.ts
│   │   ├── features/                     # Mirror FE feature structure
│   │   │   └── [feature]/
│   │   │       ├── [feature].routes.ts   # Hono route handlers
│   │   │       ├── [feature].service.ts  # Business logic + SQLite
│   │   │       └── [feature].schema.ts   # Zod schemas
│   │   └── package.json
│   │
│   ├── binaries/                         # Compiled sidecar output (git-ignored)
│   │   └── sidecar-<target-triple>[.exe]
│   ├── capabilities/
│   │   └── default.json                  # v2 permissions (incl. shell sidecar)
│   ├── src/
│   │   ├── lib.rs                        # Tauri setup + plugin registration
│   │   └── main.rs                       # Thin entry (rarely touched)
│   ├── Cargo.toml                        # Rust deps (tauri-plugin-shell, …)
│   └── tauri.conf.json                   # App config + externalBin
│
├── package.json
└── vite.config.ts
```

---

## Key Boilerplate

### `src-tauri/sidecar/index.ts`

```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { usersRoutes } from './features/users/users.routes';

const app = new Hono();

app.use('*', cors({ origin: '*' })); // Required for Tauri WebView

app.route('/api/users', usersRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
```

### `src-tauri/sidecar/db/migrations.ts`

`.sql` files must be **imported as text** so they get embedded into the compiled
binary. Do NOT `readdirSync('./migrations')` at runtime — that works under
`bun run` but throws `ENOENT` in the `bun build --compile` binary, whose virtual
filesystem has no loose `.sql` files.

```ts
import m001 from './migrations/001_init.sql' with { type: 'text' };

export const migrations: { name: string; sql: string }[] = [
  { name: '001_init.sql', sql: m001 },
];
```

> Add a migration: create the next `NNN_*.sql` and append an entry here.
> (Also add `declare module '*.sql' { const c: string; export default c }` in a
> `*.d.ts` so `tsc` accepts the text import.)

### `src-tauri/sidecar/db/index.ts`

```ts
import { Database } from 'bun:sqlite';
import { migrations } from './migrations';

const db = new Database('app.db', { create: true });
db.exec('PRAGMA journal_mode = WAL;');

// Apply embedded migrations once each, in order.
db.exec(
  `CREATE TABLE IF NOT EXISTS _migrations (
     name TEXT PRIMARY KEY,
     applied_at TEXT NOT NULL DEFAULT (datetime('now'))
   );`,
);
const applied = new Set(
  db.query<{ name: string }, []>('SELECT name FROM _migrations').all().map((r) => r.name),
);
for (const { name, sql } of migrations) {
  if (applied.has(name)) continue;
  db.transaction(() => {
    db.exec(sql);
    db.query('INSERT INTO _migrations (name) VALUES ($name)').run({ $name: name });
  })();
}

export default db;
```

> **Why a runner?** A bare `.sql` file is never applied on its own. This tracks
> applied migrations in a `_migrations` table so each runs exactly once at startup.

### `src-tauri/sidecar/features/users/users.routes.ts`

```ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from './users.schema';
import { getUsers, createUser } from './users.service';

export const usersRoutes = new Hono()
  .get('/', (c) => c.json(getUsers()))
  .post('/', zValidator('json', createUserSchema), (c) => {
    const body = c.req.valid('json');
    return c.json(createUser(body), 201);
  });
```

> `bun:sqlite` is synchronous, so the service functions are not `async` and don't
> need `await`.

### `src-tauri/sidecar/features/users/users.service.ts`

```ts
import db from '../../db';
import type { CreateUserDto, User } from './users.schema';

export function getUsers(): User[] {
  return db.query<User, []>('SELECT * FROM users ORDER BY id DESC').all();
}

export function createUser(data: CreateUserDto): User {
  return db
    .query<User, { $name: string; $email: string }>(
      'INSERT INTO users (name, email) VALUES ($name, $email) RETURNING *',
    )
    .get({ $name: data.name, $email: data.email })!;
}
```

### `src-tauri/sidecar/features/users/users.schema.ts`

```ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(), // zod v4: `z.email()` replaces the deprecated `z.string().email()`
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type User = CreateUserDto & { id: number };
```

### `src/lib/api.ts`

```ts
const BASE = 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

### `src/providers/index.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 30 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

### `src/features/users/hooks/use-users.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, CreateUserDto } from '../schemas/users.schema';

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => api.get<User[]>('/api/users'),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => api.post<User>('/api/users', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
```

### `src/hooks/use-sidecar.ts`

```ts
import { useEffect, useRef } from 'react';
import { Command, type Child } from '@tauri-apps/plugin-shell';

export function useSidecar() {
  const process = useRef<Child | null>(null);

  useEffect(() => {
    const start = async () => {
      const command = Command.sidecar('binaries/sidecar');

      command.stdout.on('data', (data) => console.log('[sidecar]', data));
      command.stderr.on('data', (err) => console.error('[sidecar error]', err));

      process.current = await command.spawn();
    };

    start();

    return () => {
      process.current?.kill();
    };
  }, []);
}
```

---

## Tauri v2 sidecar wiring

In **Tauri v2** the sidecar is declared in two places: `bundle.externalBin` in
`tauri.conf.json`, and the execute permission/scope in a **capability** file
(NOT a `plugins.shell` block — that was the v1 style).

### `src-tauri/tauri.conf.json` (relevant section)

```json
{
  "bundle": {
    "externalBin": ["binaries/sidecar"]
  }
}
```

### `src-tauri/capabilities/default.json`

```json
{
  "permissions": [
    "core:default",
    "opener:default",
    {
      "identifier": "shell:allow-execute",
      "allow": [{ "name": "binaries/sidecar", "sidecar": true, "args": true }]
    },
    "shell:allow-kill"
  ]
}
```

---

## Building the sidecar (Windows-aware)

Tauri looks for the sidecar binary named with the **Rust target triple**, e.g.
`src-tauri/binaries/sidecar-x86_64-pc-windows-msvc.exe`. A plain
`--outfile ../binaries/sidecar` will NOT be found. Use a small build script that
derives the triple from `rustc -vV` and appends `.exe` on Windows:

### `scripts/build-sidecar.ts`

```ts
import { $ } from 'bun';
import { join } from 'node:path';

const root = import.meta.dir.replace(/[\\/]scripts$/, '');
const entry = join(root, 'src-tauri', 'sidecar', 'index.ts');
const outDir = join(root, 'src-tauri', 'binaries');

const triple = (await $`rustc -vV`.text()).match(/host:\s*(\S+)/)?.[1];
if (!triple) throw new Error('Could not determine target triple from `rustc -vV`.');

const ext = process.platform === 'win32' ? '.exe' : '';
await $`bun build ${entry} --compile --outfile ${join(outDir, `sidecar-${triple}${ext}`)}`;
```

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "sidecar:dev": "bun run src-tauri/sidecar/index.ts",
    "build:sidecar": "bun run scripts/build-sidecar.ts",
    "tauri:dev": "bun run build:sidecar && tauri dev",
    "tauri:build": "bun run build:sidecar && tauri build"
  }
}
```

> **Dev tip:** For fast iteration, skip the compile and run the sidecar directly with
> `bun run sidecar:dev` in a second terminal alongside `bun run dev` — the WebView talks
> to it over `http://localhost:3000` either way. Only the compiled, triple-named binary
> is needed for `tauri:dev` / `tauri:build`.

---

## Communication Flow

```
[React Component]
      |
      | useUsers() / useCreateUser()
      |
[Tanstack Query hook]         src/features/users/hooks/
      |
      | api.get('/api/users')
      |
[API client]                  src/lib/api.ts
      |
      | fetch('http://localhost:3000/api/users')
      |
[Hono route handler]          sidecar/features/users/users.routes.ts
      |
      | getUsers()
      |
[Service layer]               sidecar/features/users/users.service.ts
      |
      | db.query(...)
      |
[SQLite via bun:sqlite]       sidecar/db/index.ts
```

---

## Adding a New Feature Checklist

### Backend
- [ ] `sidecar/features/[feature]/[feature].schema.ts` — Zod schemas
- [ ] `sidecar/features/[feature]/[feature].service.ts` — DB logic
- [ ] `sidecar/features/[feature]/[feature].routes.ts` — Hono routes
- [ ] Register route in `sidecar/index.ts`: `app.route('/api/[feature]', featureRoutes)`
- [ ] If the feature needs new tables: add `db/migrations/NNN_*.sql` **and** append it to `db/migrations.ts`

### Frontend
- [ ] `src/features/[feature]/schemas/[feature].schema.ts` — Zod types
- [ ] `src/features/[feature]/api/[feature].api.ts` — fetch calls
- [ ] `src/features/[feature]/hooks/use-[feature].ts` — Tanstack Query hooks
- [ ] `src/features/[feature]/components/` — React components
- [ ] `src/features/[feature]/index.ts` — barrel export
