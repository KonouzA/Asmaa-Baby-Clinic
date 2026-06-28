/**
 * Compiles the Bun sidecar into a single executable and names it with the Rust
 * target triple, as Tauri requires for `externalBin` sidecars:
 *   src-tauri/binaries/sidecar-<target-triple>[.exe]
 *
 * Run with: `bun run scripts/build-sidecar.ts`
 */
import { $ } from 'bun';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = import.meta.dir.replace(/[\\/]scripts$/, '');
const entry = join(root, 'src-tauri', 'sidecar', 'index.ts');
const outDir = join(root, 'src-tauri', 'binaries');
mkdirSync(outDir, { recursive: true });

const triple = await resolveTargetTriple();
const ext = process.platform === 'win32' ? '.exe' : '';
const outfile = join(outDir, `sidecar-${triple}${ext}`);

await $`bun build ${entry} --compile --outfile ${outfile}`;
console.log(`[build:sidecar] -> ${outfile}`);

/**
 * Prefer the triple reported by `rustc -vV` (authoritative, matches what Tauri
 * looks for). If Rust isn't installed yet, fall back to the default triple for
 * this host so the build still succeeds for sidecar-only iteration.
 */
async function resolveTargetTriple(): Promise<string> {
  try {
    const info = await $`rustc -vV`.text();
    const host = info.match(/host:\s*(\S+)/)?.[1];
    if (host) return host;
  } catch {
    console.warn('[build:sidecar] rustc not found — falling back to host default triple.');
  }
  const fallback: Record<string, Record<string, string>> = {
    win32: { x64: 'x86_64-pc-windows-msvc', arm64: 'aarch64-pc-windows-msvc' },
    darwin: { x64: 'x86_64-apple-darwin', arm64: 'aarch64-apple-darwin' },
    linux: { x64: 'x86_64-unknown-linux-gnu', arm64: 'aarch64-unknown-linux-gnu' },
  };
  const triple = fallback[process.platform]?.[process.arch];
  if (!triple) {
    throw new Error(`No fallback triple for ${process.platform}/${process.arch}; install Rust so rustc -vV can report it.`);
  }
  return triple;
}
