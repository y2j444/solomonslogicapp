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
    packages: 'external', // Don't bundle node_modules
    sourcemap: true,
    outExtension: { '.js': '.js' },
  });
  console.log('Agent build successful!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
