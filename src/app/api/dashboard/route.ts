import { NextResponse } from "next/server";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUserRecord();
  const ownerUserId = user.id;
  const [totalContacts, totalLeads, totalAppointments, recentCalls] =
    await prisma.$transaction([
      prisma.contact.count({ where: { ownerUserId } }),
      prisma.lead.count({ where: { ownerUserId } }),
      prisma.appointment.count({ where: { ownerUserId } }),
      prisma.callLog.count({
        where: {
          ownerUserId,
          calledAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
        },
      }),
    ]);
  return NextResponse.json({
    totalContacts,
    totalLeads,
    totalAppointments,
    recentCalls,
  });
}
