import * as esbuild from 'esbuild';

async function build() {
  await esbuild.build({
    entryPoints: [
      'agent/index.ts',
      'agent/receptionist.ts',
      'agent/prisma.ts',   // Proxy compiled to dist/agent/prisma.js so import("./prisma.js") resolves at runtime
    ],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outdir: 'dist/agent',
    format: 'esm',
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
    external: [
      '@prisma/client',
      '@livekit/rtc-node',
      'fs', 'node:fs',
      'path', 'node:path',
      'url', 'node:url',
      'child_process', 'node:child_process',
      'events', 'node:events',
      'module', 'node:module'
    ],
    sourcemap: true,
    outExtension: { '.js': '.js' },
  });
  console.log('Agent build successful!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
