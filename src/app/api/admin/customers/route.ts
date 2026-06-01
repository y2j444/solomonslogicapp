import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "michael.janico@solomonslogic.com";

async function assertAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { email: true },
  });

  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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
