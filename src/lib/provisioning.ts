// @ts-nocheck
import twilio from "twilio";
import { prisma } from "./prisma";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

/**
 * Automatically provisions a Twilio number and links it to Vapi for a user.
 */
export async function provisionBusinessAccount(userId: string, areaCode?: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !VAPI_API_KEY) {
    throw new Error("Missing API keys for Twilio or Vapi");
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // 1. Search for a local number
  const availableNumbers = await client.availablePhoneNumbers("US").local.list({
    areaCode: parseInt(areaCode || "615", 10), // Default to Franklin/Nashville area if none provided
    limit: 1,
  });

  if (availableNumbers.length === 0) {
    throw new Error("No available phone numbers found for the area code");
  }

  const twilioNumber = availableNumbers[0].phoneNumber;

  // 2. Purchase the number
  await client.incomingPhoneNumbers.create({
    phoneNumber: twilioNumber,
    // Point webhooks to your app
    voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/call`,
    smsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/sms`,
  });

  // 3. Import the number into Vapi
  const vapiResponse = await fetch("https://api.vapi.ai/phone-number", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: "twilio",
      number: twilioNumber,
      twilioAccountSid: TWILIO_ACCOUNT_SID,
      twilioAuthToken: TWILIO_AUTH_TOKEN,
      name: `Business Line: ${userId}`,
    }),
  });

  if (!vapiResponse.ok) {
    const errorData = await vapiResponse.json();
    throw new Error(`Vapi Import Failed: ${JSON.stringify(errorData)}`);
  }

  const vapiData = await vapiResponse.json();

  // 4. Update the user record in DB
  await prisma.user.update({
    where: { id: userId },
    data: {
      twilioPhone: twilioNumber,
    } as any,
  });

  return {
    success: true,
    phoneNumber: twilioNumber,
    vapiId: vapiData.id,
  };
}
