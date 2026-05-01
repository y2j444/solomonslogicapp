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

    const ownerUserId = user.id;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

    const [
      totalContacts,
      totalLeads,
      totalAppointments,
      upcomingAppointmentsCount,
      recentCalls,
      upcomingAppointments,
      recentCallItems,
    ] = await prisma.$transaction([
      prisma.contact.count({ where: { ownerUserId } }),
      prisma.lead.count({ where: { ownerUserId } }),
      prisma.appointment.count({
        where: {
          ownerUserId,
          startTime: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
      }),
      prisma.appointment.count({
        where: {
          ownerUserId,
          startTime: { gte: now },
        },
      }),
      prisma.callLog.count({
        where: {
          ownerUserId,
          calledAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.appointment.findMany({
        where: {
          ownerUserId,
          startTime: { gte: now },
        },
        orderBy: { startTime: "asc" },
        take: 5,
        include: {
          contact: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.callLog.findMany({
        where: { ownerUserId },
        orderBy: { calledAt: "desc" },
        take: 5,
        include: {
          contact: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalContacts,
      totalLeads,
      totalAppointments,
      upcomingAppointmentsCount,
      recentCalls,
      upcomingAppointments,
      recentCallItems,
      twilioPhone: user.twilioPhone,
      businessPhone: user.businessPhone,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
    });
  } catch (error) {
    console.error("[api/dashboard] FAILED:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
