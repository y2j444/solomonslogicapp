/**
 * Twilio Messaging Helper
 */
export async function sendTwilioSms(to: string, text: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error("[twilio-sms] Missing credentials in .env");
    return { success: false, error: "Missing configuration" };
  }

  // Twilio uses basic auth (AccountSid:AuthToken)
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${auth}`,
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: text,
        }).toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[twilio-sms] Send failed:", JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }

    console.log(`[twilio-sms] SMS sent to ${to}`);
    return { success: true, data };
  } catch (error) {
    console.error("[twilio-sms] Error sending SMS:", error);
    return { success: false, error };
  }
}
