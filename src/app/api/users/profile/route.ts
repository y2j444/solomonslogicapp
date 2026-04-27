import { NextResponse } from "next/server";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUserRecord();
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
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
}
