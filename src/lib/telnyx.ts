/**
 * Telnyx Phone Provisioning & SMS Helper
 *
 * - sendTelnyxSms: Send an SMS via Telnyx (used by appointments route for confirmations)
 * - provisionNumberForUser: Auto-buy & configure a dedicated Telnyx number for a new subscriber
 *   (called from Stripe webhook on checkout.session.completed)
 */

const TELNYX_API_BASE = "https://api.telnyx.com/v2";

function telnyxHeaders(): Record<string, string> {
  const key = process.env.TELNYX_API_KEY;
  if (!key) throw new Error("TELNYX_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ---------------------------------------------------------------------------
// SMS
// ---------------------------------------------------------------------------

/**
 * Send an SMS message via Telnyx.
 */
export async function sendTelnyxSms(to: string, message: string): Promise<void> {
  const from = process.env.TELNYX_PHONE_NUMBER;
  if (!from) {
    console.warn("[Telnyx SMS] TELNYX_PHONE_NUMBER not set, skipping SMS.");
    return;
  }

  const res = await fetch(`${TELNYX_API_BASE}/messages`, {
    method: "POST",
    headers: telnyxHeaders(),
    body: JSON.stringify({ from, to, text: message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telnyx SMS failed: ${JSON.stringify(err)}`);
  }

  console.log(`[Telnyx SMS] ✅ Sent to ${to}`);
}

// ---------------------------------------------------------------------------
// Phone number provisioning
// ---------------------------------------------------------------------------

interface TelnyxNumber {
  id: string;
  phone_number: string;
}

/**
 * Search for an available US phone number in a given area code.
 */
export async function searchAvailableNumber(areaCode = "615"): Promise<string | null> {
  const url = `${TELNYX_API_BASE}/available_phone_numbers?filter[national_destination_code]=${areaCode}&filter[features][]=voice&limit=5`;
  const res = await fetch(url, { headers: telnyxHeaders() });
  const json = await res.json();

  if (!res.ok) {
    console.error("[Telnyx] Search failed:", json);
    return null;
  }

  const numbers: any[] = json.data || [];
  return numbers[0]?.phone_number || null;
}

/**
 * Purchase a phone number from Telnyx.
 */
export async function purchaseNumber(phoneNumber: string): Promise<TelnyxNumber | null> {
  const res = await fetch(`${TELNYX_API_BASE}/number_orders`, {
    method: "POST",
    headers: telnyxHeaders(),
    body: JSON.stringify({
      phone_numbers: [{ phone_number: phoneNumber }],
    }),
  });
  const json = await res.json();

  if (!res.ok) {
    console.error("[Telnyx] Purchase failed:", json);
    return null;
  }

  const purchased = json.data?.phone_numbers?.[0];
  if (!purchased) return null;

  return {
    id: purchased.id,
    phone_number: purchased.phone_number,
  };
}

import { SipClient } from "livekit-server-sdk";

/**
 * Configure the purchased number so inbound calls are routed to LiveKit SIP,
 * and SMS is routed to the correct webhook. Then, dynamically provision the
 * LiveKit SIP Trunk and Dispatch Rule for this specific number.
 */
export async function configureNumberWebhook(phoneNumber: string): Promise<boolean> {
  // Look up the number record in Telnyx by phone number string
  const listRes = await fetch(
    `${TELNYX_API_BASE}/phone_numbers?filter[phone_number]=${encodeURIComponent(phoneNumber)}&page[size]=5`,
    { headers: telnyxHeaders() }
  );
  const listJson = await listRes.json();
  const record = listJson.data?.[0];

  if (!record) {
    console.error("[Telnyx] Could not find number to configure:", phoneNumber);
    return false;
  }

  // Hardcoded known good connection & profile from the demo number setup
  const LIVEKIT_CONNECTION_ID = "2953272336683369806";
  const MESSAGING_PROFILE_ID = "40019e6f-b702-4f94-9fc6-8ee539de1a67";

  // 1. Assign to the LiveKit SIP Connection
  const updateRes = await fetch(`${TELNYX_API_BASE}/phone_numbers/${record.id}`, {
    method: "PATCH",
    headers: telnyxHeaders(),
    body: JSON.stringify({ 
      connection_id: LIVEKIT_CONNECTION_ID,
      hd_voice_enabled: true 
    }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    console.error("[Telnyx] Number update failed:", err);
  }

  // 2. Assign to the correct Messaging Profile for SMS routing
  const msgRes = await fetch(`${TELNYX_API_BASE}/phone_numbers/${record.id}/messaging`, {
    method: "PATCH",
    headers: telnyxHeaders(),
    body: JSON.stringify({
      messaging_profile_id: MESSAGING_PROFILE_ID
    }),
  });

  if (!msgRes.ok) {
    const err = await msgRes.json();
    console.error("[Telnyx] Messaging profile assignment failed:", err);
  }

  // 3. Provision LiveKit SIP Trunk and Dispatch Rule
  try {
    const livekitApiUrl = process.env.LIVEKIT_URL || "https://main-receptionist-mk1o51ej.livekit.cloud";
    const sipClient = new SipClient(
      livekitApiUrl, 
      process.env.LIVEKIT_API_KEY, 
      process.env.LIVEKIT_API_SECRET
    );

    const cleanNumber = phoneNumber.replace("+", "");
    const withPlus = "+" + cleanNumber;

    // Create 1-to-1 trunk for this number
    const trunk = await sipClient.createSipInboundTrunk(`Auto Trunk ${withPlus}`, [withPlus, cleanNumber]);
    
    // Create dispatch rule for this trunk
    await sipClient.createSipDispatchRule({
      type: "individual",
      roomPrefix: `${cleanNumber}-`,
      pin: ""
    }, {
      name: `Auto Rule ${withPlus}`,
      trunkIds: [trunk.sipTrunkId],
      roomConfig: { agents: [{ agentName: "solomon" } as any] } as any
    });
    
    console.log(`[LiveKit] Provisioned SIP Trunk and Dispatch Rule for ${withPlus}`);
  } catch (lkErr) {
    console.error("[LiveKit] Failed to provision SIP Trunk/Rule:", lkErr);
  }

  console.log(`[Telnyx] Configured ${phoneNumber} → Connection: ${LIVEKIT_CONNECTION_ID}`);
  return true;
}

/**
 * Full provisioning flow: search → purchase → configure webhook → return E.164 number.
 * Tries the preferred area code first, falls back to any US number.
 * Returns null on any failure.
 */
export async function provisionNumberForUser(preferredAreaCode = "615"): Promise<string | null> {
  try {
    console.log(`[Telnyx] Searching for available number in area code ${preferredAreaCode}...`);

    let available = await searchAvailableNumber(preferredAreaCode);

    if (!available) {
      console.warn(`[Telnyx] No numbers in ${preferredAreaCode}, searching nationally...`);
      available = await searchAvailableNumber("888");
    }
    if (!available) {
      console.error("[Telnyx] No available numbers found.");
      return null;
    }

    console.log(`[Telnyx] Purchasing ${available}...`);
    const purchased = await purchaseNumber(available);
    if (!purchased) return null;

    const number = purchased.phone_number;
    console.log(`[Telnyx] Purchased ${number}. Configuring webhook...`);

    // Give Telnyx a moment to provision before configuring
    await new Promise((r) => setTimeout(r, 3000));
    await configureNumberWebhook(number);

    console.log(`[Telnyx] ✅ Provisioned number: ${number}`);
    return number;
  } catch (err) {
    console.error("[Telnyx] Provisioning error:", err);
    return null;
  }
}
