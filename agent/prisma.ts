/**
 * Prisma proxy for the agent directory.
 *
 * WHY THIS EXISTS:
 * - In production, esbuild compiles `src/lib/prisma.ts` into `dist/agent/prisma.js`
 *   alongside `receptionist.js`, so `import("./prisma.js")` resolves correctly.
 * - In dev, tsx runs from the `agent/` folder where `../src/lib/prisma` is the real path.
 *   This proxy file lets both environments use the same `"./prisma.js"` import path.
 */
export { prisma } from "../src/lib/prisma.js";
