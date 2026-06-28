import { useEffect, useRef } from 'react';
import { Command, type Child } from '@tauri-apps/plugin-shell';

/**
 * Spawns the compiled Bun sidecar for the lifetime of the app.
 *
 * In development you can skip this and run the sidecar directly
 * (`bun run src-tauri/sidecar/index.ts`) for faster iteration — see CLAUDE.md.
 */
export function useSidecar() {
  const process = useRef<Child | null>(null);

  useEffect(() => {
    let killed = false;

    const start = async () => {
      const command = Command.sidecar('binaries/sidecar');

      command.stdout.on('data', (data) => console.log('[sidecar]', data));
      command.stderr.on('data', (err) => console.error('[sidecar error]', err));

      const child = await command.spawn();
      if (killed) {
        // Effect was cleaned up before spawn resolved (e.g. StrictMode remount).
        await child.kill();
        return;
      }
      process.current = child;
    };

    start();

    return () => {
      killed = true;
      process.current?.kill();
      process.current = null;
    };
  }, []);
}
