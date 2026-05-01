// @ts-nocheck
import { NextResponse } from "next/server";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUserRecord();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET failed:", error);
    return NextResponse.json(
      {
        error: "Profile lookup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUserRecord();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      businessName?: string;
      businessPhone?: string;
      twilioPhone?: string;
    };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName ?? (user as any).firstName,
        lastName: body.lastName ?? (user as any).lastName,
        businessName: body.businessName ?? (user as any).businessName,
        businessPhone: body.businessPhone ?? (user as any).businessPhone,
        twilioPhone: body.twilioPhone ?? (user as any).twilioPhone,
      } as any,
    });

    // Auto-provision if no phone exists yet
    if (!updated.twilioPhone && updated.businessPhone) {
      try {
        const { provisionBusinessAccount } = await import("@/lib/provisioning");
        await provisionBusinessAccount(updated.id);
      } catch (err) {
        console.error("Auto-provisioning failed:", err);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile PATCH failed:", error);
    return NextResponse.json(
      {
        error: "Profile update failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}