/**
 * Telnyx Messaging Helper
 */
export async function sendTelnyxSms(to: string, text: string) {
  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TWILIO_PHONE_NUMBER || process.env.TELNYX_PHONE_NUMBER; // Fallback to whatever number is set

  if (!apiKey) {
    console.error("[telnyx] Missing TELNYX_API_KEY in .env");
    return { success: false, error: "Missing API Key" };
  }

  if (!from) {
    console.error("[telnyx] Missing sender phone number in .env");
    return { success: false, error: "Missing sender number" };
  }

  try {
    const response = await fetch("https://api.telnyx.com/v2/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: from,
        to: to,
        text: text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[telnyx] Send failed:", JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }

    console.log(`[telnyx] SMS sent to ${to}`);
    return { success: true, data };
  } catch (error) {
    console.error("[telnyx] Error sending SMS:", error);
    return { success: false, error };
  }
}
