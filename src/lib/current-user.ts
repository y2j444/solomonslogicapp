import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

export async function getCurrentUserRecord() {
  const authResult = await auth();
  const clerkUserId = authResult.userId;

  if (clerkUserId) {
    const existingByClerkId = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (existingByClerkId) {
      return existingByClerkId;
    }

    const clerkUser = await currentUser();
    const clerkEmail = normalizeEmail(
      clerkUser?.primaryEmailAddress?.emailAddress
    );

    const clerkFirstName = clerkUser?.firstName ?? null;
    const clerkLastName = clerkUser?.lastName ?? null;

    if (clerkEmail) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: clerkEmail },
      });

      if (existingByEmail) {
        return prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkUserId,
            firstName: existingByEmail.firstName ?? clerkFirstName,
            lastName: existingByEmail.lastName ?? clerkLastName,
          },
        });
      }

      return prisma.user.create({
        data: {
          clerkUserId,
          email: clerkEmail,
          firstName: clerkFirstName,
          lastName: clerkLastName,
          businessName: clerkUser?.publicMetadata?.businessName
            ? String(clerkUser.publicMetadata.businessName)
            : "New Business",
        },
      });
    }

    return prisma.user.create({
      data: {
        clerkUserId,
        email: `${clerkUserId}@local.dev`,
        firstName: clerkFirstName,
        lastName: clerkLastName,
        businessName: "New Business",
      },
    });
  }

  const fallbackEmail = "demo@solomonslogic.local";

  const fallback = await prisma.user.findUnique({
    where: { email: fallbackEmail },
  });

  if (fallback) {
    return fallback;
  }

  return prisma.user.create({
    data: {
      email: fallbackEmail,
      firstName: "Demo",
      lastName: "User",
      businessName: "Solomons Logic LLC",
      twilioPhone: process.env.TWILIO_PHONE_NUMBER ?? null,
    },
  });
}