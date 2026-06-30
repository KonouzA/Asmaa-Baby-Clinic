# ABC — Tauri Desktop App

A cross-platform desktop app built with **Tauri v2**. The UI is a **React + TypeScript**
WebView that talks over HTTP to a **Bun + Hono** backend shipped as a Tauri **sidecar**,
with data stored in **SQLite** (`bun:sqlite`).

> **Repo layout note:** the app lives in the inner folder `ABC/ABC/`. Run every command
> below from there. See [`CLAUDE.md`](./CLAUDE.md) for architecture and conventions, and
> [`docs/projectStructure.md`](./docs/projectStructure.md) for the full scaffold reference.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| UI | shadcn + Tailwind CSS v4, lucide icons |
| Server state | TanStack Query v5 |
| Validation | Zod v4 |
| Sidecar | Bun runtime, Hono, `@hono/zod-validator`, `bun:sqlite` |
| Desktop | Tauri v2 (Rust), `tauri-plugin-shell` |
| Tooling | Bun (package manager + runtime) |

## Prerequisites

- **[Bun](https://bun.sh)** — package manager + runtime.
- **[Rust toolchain](https://rustup.rs)** (`rustc` + `cargo`) — **required by Tauri** to
  build/run the desktop shell. On Windows you also need the **MSVC C++ Build Tools**
  (Visual Studio Build Tools → "Desktop development with C++").
  - The frontend and sidecar run **without** Rust — it's only needed for the
    `tauri:*` commands.
- See the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.

## Setup

```bash
cd ABC/ABC          # the inner app root — all commands run from here
bun install         # frontend dependencies

# sidecar dependencies
cd src-tauri/sidecar && bun install && cd ../..
```

## Running the app

### Option A — Fast dev loop (no Rust required)

Run the sidecar and the frontend in two separate terminals:

```bash
# Terminal 1 — Bun/Hono API on http://localhost:3000
bun run sidecar:dev

# Terminal 2 — Vite frontend on http://localhost:1420
bun run dev
```

Open <http://localhost:1420>. This skips the sidecar compile and the Rust build — best
for day-to-day iteration.

### Option B — Full desktop app (requires Rust)

```bash
bun run tauri:dev   # compiles the sidecar, then launches the native window
```

The app spawns the compiled sidecar automatically for its lifetime.

## Building a distributable

```bash
bun run build:sidecar   # compile sidecar -> src-tauri/binaries/sidecar-<triple>[.exe]
bun run tauri:build     # produce a native installer (requires Rust)
```

## Scripts reference

| Command | Description | Needs Rust? |
|---|---|---|
| `bun run dev` | Vite frontend only | No |
| `bun run sidecar:dev` | Run the Hono/SQLite API on `:3000` | No |
| `bun run build:sidecar` | Compile the sidecar to `src-tauri/binaries/` | No |
| `bun run tauri:dev` | Build sidecar + launch the native app (dev) | **Yes** |
| `bun run tauri:build` | Build sidecar + produce an installer | **Yes** |
| `bun run build` | Type-check + Vite production build (web assets) | No |

## Project structure

```
ABC/ABC/
├── src/                      # React frontend
│   ├── features/             # Feature folders (components, hooks, api, schemas)
│   ├── hooks/use-sidecar.ts  # Spawns the sidecar in the Tauri app
│   ├── lib/api.ts            # Fetch wrapper
│   └── providers/            # TanStack Query provider
├── scripts/build-sidecar.ts  # Compiles sidecar with the Rust target-triple name
└── src-tauri/
    ├── sidecar/              # Bun + Hono backend (mirrors src/features)
    │   ├── db/               # SQLite connection + migrations
    │   └── features/
    ├── capabilities/         # Tauri v2 permissions (incl. shell sidecar)
    └── tauri.conf.json
```

## Adding a feature

Create matching `features/<name>/` folders on both sides (frontend + sidecar). See the
`users` feature as the reference example and the "Adding a feature" section in
[`CLAUDE.md`](./CLAUDE.md).

## Troubleshooting

- **`tauri:dev` fails with a Rust/cargo error** — install the Rust toolchain and MSVC
  C++ Build Tools (see Prerequisites), then restart your terminal.
- **Frontend can't reach the API** — make sure the sidecar is running (`bun run
  sidecar:dev`) and listening on `http://localhost:3000`.
- **Reset the database** — delete the `app.db*` files created in the sidecar's working
  directory; they're recreated (with migrations) on next start.
