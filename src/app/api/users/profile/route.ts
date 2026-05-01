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
        firstName: body.firstName ?? user.firstName,
        lastName: body.lastName ?? user.lastName,
        businessName: body.businessName ?? user.businessName,
        businessPhone: body.businessPhone ?? user.businessPhone,
        twilioPhone: body.twilioPhone ?? user.twilioPhone,
      },
    });

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