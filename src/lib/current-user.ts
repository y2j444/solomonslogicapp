import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

export async function getCurrentUserRecord() {
  console.log("[getCurrentUserRecord] START");
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    console.log("[getCurrentUserRecord] clerkUserId:", clerkUserId);

    if (clerkUserId) {
      console.log("[getCurrentUserRecord] Finding user in DB...");
      const existingByClerkId = await prisma.user.findUnique({
        where: { clerkUserId },
      });

      if (existingByClerkId) {
        return existingByClerkId;
      }

      console.log("[getCurrentUserRecord] User not found, fetching Clerk data...");
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
          console.log("[getCurrentUserRecord] Found existing user by email, syncing clerkUserId...");
          return prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              clerkUserId,
              firstName: existingByEmail.firstName ?? clerkFirstName,
              lastName: existingByEmail.lastName ?? clerkLastName,
            } as any,
          });
        }

        console.log("[getCurrentUserRecord] Creating new user record...");
        return prisma.user.create({
          data: {
            clerkUserId,
            email: clerkEmail,
            firstName: clerkFirstName,
            lastName: clerkLastName,
            businessName: clerkUser?.publicMetadata?.businessName
              ? String(clerkUser.publicMetadata.businessName)
              : "New Business",
          } as any,
        });
      }

      console.log("[getCurrentUserRecord] Creating generic user record...");
      return prisma.user.create({
        data: {
          clerkUserId,
          email: `${clerkUserId}@local.dev`,
          firstName: clerkFirstName,
          lastName: clerkLastName,
          businessName: "New Business",
        } as any,
      });
    }

    const fallbackEmail = "demo@solomonslogic.local";
    console.log("[getCurrentUserRecord] No clerkUserId, checking fallback:", fallbackEmail);
    
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
      } as any,
    });
  } catch (err) {
    console.error("[getCurrentUserRecord] FATAL ERROR:", err);
    throw err;
  }
}