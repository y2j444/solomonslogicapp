import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_USER_ID;

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  // If ADMIN_CLERK_USER_ID is set, enforce it. Otherwise, first user wins.
  if (ADMIN_CLERK_ID) return userId === ADMIN_CLERK_ID;
  return true; // dev fallback
}

export const dynamic = "force-dynamic";

/** GET /api/admin/customers — list all users */
export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customers = await prisma.user.findMany({
    orderBy: { joinedAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      businessName: true,
      businessPhone: true,
      AIPhone: true,
      knowledgeBase: true,
      callHandlingRules: true,
      subscriptionStatus: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      joinedAt: true,
      _count: {
        select: {
          contacts: true,
          callLogs: true,
          appointments: true,
        },
      },
    },
  });

  return NextResponse.json(customers);
}

/** PATCH /api/admin/customers — update a customer's AI config */
export async function PATCH(req: Request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    userId: string;
    knowledgeBase?: string;
    callHandlingRules?: string;
    businessName?: string;
    AIPhone?: string;
    businessPhone?: string;
  };

  if (!body.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: {
      ...(body.knowledgeBase !== undefined && { knowledgeBase: body.knowledgeBase }),
      ...(body.callHandlingRules !== undefined && { callHandlingRules: body.callHandlingRules }),
      ...(body.businessName !== undefined && { businessName: body.businessName }),
      ...(body.AIPhone !== undefined && { AIPhone: body.AIPhone }),
      ...(body.businessPhone !== undefined && { businessPhone: body.businessPhone }),
    },
  });

  return NextResponse.json(updated);
}
