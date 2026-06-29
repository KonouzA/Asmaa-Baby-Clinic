# CLAUDE.md

Guidance for working in this repo. See `../projectStructure.md` for the full scaffold reference and boilerplate.

## What this is

A **Tauri v2** desktop app for a single-doctor pediatric clinic: a React WebView frontend
talking over HTTP to a **Bun + Hono** backend that ships as a Tauri **sidecar** (a compiled
binary bundled with the app). Data lives in **SQLite** via `bun:sqlite`.

## Repo location

The working directory (`C:\Users\KonouzAbdelaziz\Desktop\Asmaa-Baby-Clinic`) **is** the app
root — `package.json`, `src/`, and `src-tauri/` are all here. (The outer `ABC/` wrapper
described in `projectStructure.md` was flattened; ignore that reference.)

## Prerequisites

- **Bun** (installed).
- **Rust toolchain** (`rustc` + `cargo`) — required by Tauri to build/run the desktop
  shell. ⚠️ **Not currently installed on this machine** — `tauri:dev` / `tauri:build`
  will fail until you install it via <https://rustup.rs> (plus MSVC C++ Build Tools on
  Windows). The frontend (`bun run dev`) and sidecar (`bun run sidecar:dev`) work
  without Rust.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript, Vite 7 |
| UI | shadcn (radix-ui, `cva`, `clsx`, `tailwind-merge`, lucide), Tailwind CSS v4 (`@tailwindcss/vite`) |
| Server state | TanStack Query v5 (+ devtools) |
| Validation | Zod **v4** (use `z.email()`, not the deprecated `z.string().email()`) |
| Sidecar | Bun runtime, Hono, `@hono/zod-validator`, `bun:sqlite` |
| Desktop | Tauri v2 (Rust), `tauri-plugin-shell` (spawns sidecar), `tauri-plugin-opener` |
| Tooling | Bun (package manager + runtime) |

## Commands

```bash
bun install                 # install frontend deps
bun run dev                 # Vite dev server only (no Tauri window)
bun run sidecar:dev         # run the Bun sidecar directly on :3000 (fast dev loop)
bun run build:sidecar       # compile sidecar -> src-tauri/binaries/sidecar-<triple>[.exe]
bun run tauri:dev           # build sidecar, then launch the Tauri app
bun run tauri:build         # build sidecar, then produce a distributable bundle
```

Type-check: `bunx tsc --noEmit` (frontend) and the same inside `src-tauri/sidecar/`.

## Dev workflow

- **Fast loop:** run `bun run sidecar:dev` in one terminal and `bun run dev` in another.
  The WebView calls `http://localhost:3000` regardless of whether the sidecar is the dev
  process or the compiled binary.
- **Full app:** `bun run tauri:dev` — this compiles the sidecar and `useSidecar()`
  (in `src/App.tsx`) spawns it for the app's lifetime.
- The SQLite file (`app.db*`) is created in the sidecar's working directory; it's
  git-ignored and safe to delete to reset state.

## Architecture & conventions

Request flow: **Component → TanStack Query hook → `src/lib/api.ts` → Hono route →
service → `bun:sqlite`**.

**Feature-folder pattern, mirrored on both sides.** Frontend and sidecar each have a
`features/<name>/` folder; keep names in sync.

- Frontend feature: `src/features/<name>/{schemas,api,hooks,components,index.ts}`
- Sidecar feature: `src-tauri/sidecar/features/<name>/<name>.{schema,service,routes}.ts`
- Import alias `@/` → `src/` (configured in `vite.config.ts` + `tsconfig.json`).
- `bun:sqlite` is **synchronous** — service functions are not `async`.

### Adding a feature

**Sidecar:** add `<name>.schema.ts` (Zod), `<name>.service.ts` (DB), `<name>.routes.ts`
(Hono), then register in `src-tauri/sidecar/index.ts` with
`app.route('/api/<name>', <name>Routes)`. New tables go in a new
`src-tauri/sidecar/db/migrations/NNN_*.sql` **and** must be appended to the registry
in `src-tauri/sidecar/db/migrations.ts` (SQL is imported as text so it embeds into the
compiled binary — a runtime `readdir` does NOT work in `--compile` output). Migrations
apply once each at startup.

**Frontend:** add `schemas/`, `api/`, `hooks/use-<name>.ts`, `components/`, and a
barrel `index.ts`.

## Database schema

Full schema in `src-tauri/sidecar/db/migrations/001_init.sql`. 12 tables across 3 logical entities:

**Patient** — `patient`, `patient_allergies`, `patient_problems`, `patient_medications`, `patient_immunizations`  
**Visit** — `visit`, `visit_exam_findings`, `visit_medications`, `visit_diagnoses`, `visit_screenings`, `visit_attachments`  
**Report** — `report` (monthly cost inputs; totals computed from `visit.fee` at query time)

Key conventions:
- All primary keys are **UUIDs** (`TEXT NOT NULL`), generated in the service layer with `crypto.randomUUID()`.
- **MRN** is auto-generated as `P-0001`, `P-0002` … using the `_sequences` table. In the patient service, increment the counter and format before insert:
  ```typescript
  db.run("UPDATE _sequences SET value = value + 1 WHERE name = 'patient_mrn'");
  const { value } = db.query("SELECT value FROM _sequences WHERE name = 'patient_mrn'").get() as { value: number };
  const mrn = `P-${value.toString().padStart(4, '0')}`;
  ```
- **Computed fields** (BMI, growth percentiles, z-scores, age at visit, BP percentile) are **not stored** — derive them in the application layer.
- Enable FK enforcement at DB init: `db.run("PRAGMA foreign_keys = ON")` — `bun:sqlite` does not enable it by default.

## Tauri v2 gotchas

- **Sidecar binary naming:** the compiled binary MUST be suffixed with the Rust target
  triple (e.g. `sidecar-x86_64-pc-windows-msvc.exe`) or Tauri won't find it.
  `scripts/build-sidecar.ts` handles this — don't hand-name it `sidecar`.
- **Permissions live in capabilities**, not `tauri.conf.json`. Spawning the sidecar
  requires `shell:allow-execute` (with a sidecar scope entry) + `shell:allow-kill` in
  `src-tauri/capabilities/default.json`. `bundle.externalBin` stays in
  `tauri.conf.json`. Registering a new Rust plugin also requires
  `.plugin(...)` in `src-tauri/src/lib.rs`.
- CORS is wide-open (`origin: '*'`) in the sidecar because the WebView is a different
  origin; this is local-only traffic.
