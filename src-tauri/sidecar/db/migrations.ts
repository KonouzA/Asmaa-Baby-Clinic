// Explicit, ordered migration registry.
//
// SQL files are imported as *text* (`with { type: 'text' }`) so they get embedded
// into the compiled sidecar binary by `bun build --compile`. A runtime
// `readdirSync` over ./migrations works with `bun run` but NOT in the compiled
// binary (loose files aren't on its virtual filesystem) — hence this registry.
//
// To add a migration: create the next `NNN_*.sql` file and append an entry here.
import m001 from './migrations/001_init.sql' with { type: 'text' };
import m002 from './migrations/002_auth.sql' with { type: 'text' };

export const migrations: { name: string; sql: string }[] = [
  { name: '001_init.sql', sql: m001 },
  { name: '002_auth.sql', sql: m002 },
];
