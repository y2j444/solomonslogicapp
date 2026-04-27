import { NextResponse } from "next/server";

function safeDatabaseInfo(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return {
      exists: false,
      protocol: null,
      host: null,
      port: null,
      database: null,
    };
  }

  try {
    const parsed = new URL(databaseUrl);

    return {
      exists: true,
      protocol: parsed.protocol,
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.replace("/", ""),
    };
  } catch {
    return {
      exists: true,
      protocol: "invalid",
      host: null,
      port: null,
      database: null,
    };
  }
}

export async function GET() {
  return NextResponse.json({
    databaseUrl: safeDatabaseInfo(process.env.DATABASE_URL),
    clerkSecretKeyExists: Boolean(process.env.CLERK_SECRET_KEY),
    clerkPublishableKeyExists: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}