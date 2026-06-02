import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { provisionNumberForUser, sendTelnyxSms } from "@/lib/telnyx";
import { generateAIConfig } from "@/lib/ai-config-generator";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && session.metadata?.userId) {
          const subscription = (await stripe.subscriptions.retrieve(
            session.subscription as string
          )) as any;

          // 1. Update subscription billing fields
          await prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              subscriptionStatus: subscription.status,
            },
          });
          console.log(`[Stripe] Updated subscription for user ${session.metadata.userId}`);

          // 2. Fetch full user profile
          const user = await prisma.user.findUnique({
            where: { id: session.metadata.userId },
            select: { AIPhone: true, email: true, businessName: true, businessPhone: true, knowledgeBase: true },
          });

          // 3. Auto-provision a dedicated Telnyx phone number (if not already assigned)
          if (!user?.AIPhone) {
            console.log(`[Telnyx] Provisioning number for user ${session.metadata.userId}...`);
            const provisionedNumber = await provisionNumberForUser("615");

            if (provisionedNumber) {
              await prisma.user.update({
                where: { id: session.metadata.userId },
                data: { AIPhone: provisionedNumber },
              });
              console.log(`[Telnyx] ✅ Assigned ${provisionedNumber} to user ${session.metadata.userId} (${user?.email})`);
            } else {
              console.error(`[Telnyx] ❌ Failed to provision number for user ${session.metadata.userId}`);
            }
          } else {
            console.log(`[Telnyx] User ${session.metadata.userId} already has AIPhone: ${user.AIPhone}`);
          }

          // 4. Auto-generate AI knowledge base & call handling rules if not already set
          if (!user?.knowledgeBase && user?.businessName) {
            try {
              console.log(`[AI Config] Auto-generating Sara config for ${user.businessName}...`);
              const { knowledgeBase, callHandlingRules } = await generateAIConfig(
                user.businessName,
                user.businessPhone || ""
              );
              await prisma.user.update({
                where: { id: session.metadata.userId },
                data: { knowledgeBase, callHandlingRules },
              });
              console.log(`[AI Config] ✅ Sara configured for ${user.businessName}`);
            } catch (aiErr) {
              console.error("[AI Config] Failed to generate AI config:", aiErr);
            }
          }

          // 5. Send SMS notification to Mike
          const adminPhone = process.env.ADMIN_PHONE;
          if (adminPhone) {
            try {
              await sendTelnyxSms(adminPhone, `🎉 New Signup! ${user?.businessName || user?.email} just subscribed. Sara's AI config was auto-generated. Review at app.solomonslogic.com/admin`);
            } catch (smsErr) {
              console.error("[Stripe] Failed to send admin SMS:", smsErr);
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = (await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )) as any;

          await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              subscriptionStatus: subscription.status,
            },
          });
          console.log(`Payment succeeded for subscription ${subscription.id}`);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            subscriptionStatus: subscription.status,
          },
        });
        console.log(`Subscription ${subscription.id} updated/deleted to status: ${subscription.status}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
