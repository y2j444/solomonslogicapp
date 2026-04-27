import { NextResponse } from "next/server";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUserRecord();
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
    const body = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      businessName?: string;
      twilioPhone?: string;
    };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName ?? user.firstName,
        lastName: body.lastName ?? user.lastName,
        businessName: body.businessName ?? user.businessName,
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