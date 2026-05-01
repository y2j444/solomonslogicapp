import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

export async function getCurrentUserRecord() {
  console.log("[getCurrentUserRecord] START (BYPASS AUTH)");
  try {
    // const authResult = await auth();
    // const clerkUserId = authResult.userId;
    const clerkUserId = "user_2lV8P9N9S8F8B8C8D8E8F8G8H8I"; // Dummy ID
    console.log("[getCurrentUserRecord] Using dummy clerkUserId:", clerkUserId);

    if (clerkUserId) {
      console.log("[getCurrentUserRecord] Checking DB for clerkUserId:", clerkUserId);
      const existingByClerkId = await prisma.user.findUnique({
        where: { clerkUserId },
      });

      if (existingByClerkId) {
        console.log("[getCurrentUserRecord] Found existing user by clerkUserId");
        return existingByClerkId;
      }

      console.log("[getCurrentUserRecord] Not found in DB, using fallback clerk data...");
      // const clerkUser = await currentUser();
      const clerkUser = null;
      const clerkEmail = normalizeEmail(
        clerkUser?.primaryEmailAddress?.emailAddress
      );

      const clerkFirstName = clerkUser?.firstName ?? null;
      const clerkLastName = clerkUser?.lastName ?? null;

      if (clerkEmail) {
        console.log("[getCurrentUserRecord] Checking DB for clerkEmail:", clerkEmail);
        const existingByEmail = await prisma.user.findUnique({
          where: { email: clerkEmail },
        });

        if (existingByEmail) {
          console.log("[getCurrentUserRecord] Found existing user by email, updating with clerkUserId...");
          return prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              clerkUserId,
              firstName: existingByEmail.firstName ?? clerkFirstName,
              lastName: existingByEmail.lastName ?? clerkLastName,
            },
          });
        }

        console.log("[getCurrentUserRecord] Creating new user for email:", clerkEmail);
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

      console.log("[getCurrentUserRecord] No clerkEmail found, creating generic user record");
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

    console.log("[getCurrentUserRecord] No clerkUserId, checking for demo user...");
    const fallbackEmail = "demo@solomonslogic.local";
    const fallback = await prisma.user.findUnique({
      where: { email: fallbackEmail },
    });

    if (fallback) {
      console.log("[getCurrentUserRecord] Returning demo user");
      return fallback;
    }

    console.log("[getCurrentUserRecord] Creating demo user record");
    return prisma.user.create({
      data: {
        email: fallbackEmail,
        firstName: "Demo",
        lastName: "User",
        businessName: "Solomons Logic LLC",
        twilioPhone: process.env.TWILIO_PHONE_NUMBER ?? null,
      },
    });
  } catch (err) {
    console.error("[getCurrentUserRecord] FATAL ERROR:", err);
    throw err;
  }
}