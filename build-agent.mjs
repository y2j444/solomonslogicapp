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
    external: [
      '@prisma/client',
      '@livekit/rtc-node', // Native dependency
      'node:child_process',
      'node:path',
      'node:fs',
      'node:url',
      'node:events'
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
