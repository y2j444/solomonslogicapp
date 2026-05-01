import { NextResponse } from "next/server";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, AppointmentType } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserRecord();
    const body = await request.json();
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.appointment.findFirst({
      where: { id, ownerUserId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        startTime: body.startTime ? new Date(body.startTime) : existing.startTime,
        durationMinutes: body.durationMinutes ?? existing.durationMinutes,
        status: (body.status as AppointmentStatus) ?? existing.status,
        type: (body.type as AppointmentType) ?? existing.type,
        notes: body.notes ?? existing.notes,
        contactId: body.contactId === undefined ? existing.contactId : body.contactId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[appointment_patch] Error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserRecord();
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.appointment.findFirst({
      where: { id, ownerUserId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[appointment_delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
