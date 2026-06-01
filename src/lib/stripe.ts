import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any, // Using stable generic version or specific version based on current SDK
  appInfo: {
    name: "Solomon's Logic AI Receptionist",
    version: "0.1.0",
  },
});
