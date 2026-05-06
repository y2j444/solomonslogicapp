# Solomon's Logic AI Receptionist Onboarding Guide

Welcome to the Solomon's Logic AI Receptionist system. This guide outlines the steps required to onboard a new company and activate their AI receptionist.

---

## 1. User Sign-up & Profile Creation

When a new user (a company owner) signs up with their email, the following happens:

1.  **Authentication**: The user registers via the **Clerk** authentication portal.
2.  **Database Record**: Upon their first login, the system automatically creates a `User` record in our CRM database.
3.  **Onboarding Notice**: Upon their first login, if their profile is incomplete, the system automatically redirects them to a dedicated **Onboarding** page.
4.  **Profile Update**:
    *   The user fills out the **Onboarding** form (First Name, Last Name, Business Name, and Business Phone Number).
    *   Once submitted, they are redirected to their Dashboard.

---

## 2. Service Activation (Automated)

Once the user provides their business details, the system handles the rest:

1.  **AI Number Provisioning**: The system automatically searches for and purchases a new Twilio number for the user's business.
2.  **Vapi Integration**: The new number is automatically imported into Vapi and linked to the AI Assistant.
3.  **Ready to Use**: The user's **AI Receptionist Number** will appear on their dashboard and settings page.

---

---

## 3. Phone System Setup (Manual Steps)

Depending on which stack you are using, follow the relevant guide below.

### Option A: The New Stack (Telnyx + LiveKit)
This is the high-performance, low-latency stack used for the Solomon Agent.

1.  **Telnyx Setup**:
    *   **Buy a Number**: Search and buy a number in the Telnyx Portal.
    *   **Create SIP Connection**: Go to **Voice -> IP Connections** and create a "SIP Connection".
    *   **Assign Number**: Assign your new number to this SIP Connection.
2.  **LiveKit Setup**:
    *   **Create Inbound Trunk**: In the LiveKit Dashboard, go to **SIP -> Inbound Trunks**. Create a new trunk and copy the **Trunk ID**.
    *   **Add Dispatch Rule**: Go to **SIP -> Dispatch Rules**. Create a rule that points to your Trunk ID and uses the `receptionist` metadata/tag.
3.  **Telnyx Forwarding**:
    *   In Telnyx, set your Number's "Inbound Call Handling" to use the LiveKit SIP URI provided in the LiveKit Trunk settings.
4.  **Run the Agent**:
    *   `npm run agent` on your local machine or server.

### Option B: The Legacy Stack (Twilio + Vapi)
This is the standard webhook-based flow.

1.  **Twilio Setup**:
    *   **Buy a Number**: Buy a number in the Twilio Console.
    *   **Configure Webhook**: Set the **"A Call Comes In"** webhook URL to:
        `https://app.solomonslogic.com/api/webhooks/twilio/call`
    *   Ensure the method is set to **HTTP POST**.
2.  **Vapi Setup**:
    *   **Connect Twilio**: Add your Twilio Account SID and Auth Token to Vapi.
    *   **Import Number**: Import your Twilio number into Vapi.
    *   **Set Tool URL**: Ensure the **Booking Tool** in Vapi is pointing to:
        `https://app.solomonslogic.com/api/appointments`

---

## 4. How the AI Receptionist Works

1.  **Call Handling**:
    *   **Telnyx/LiveKit**: The call is routed via SIP directly to your local `npm run agent` process for sub-200ms latency.
    *   **Twilio/Vapi**: Twilio sends a webhook to Solomon's server, which then triggers the Vapi voice pipeline.
2.  **Booking**: Both systems call the `/api/appointments` endpoint to check availability and save records to the database.

---

## 5. Using a Personal/Existing Number

If you want the AI to answer calls to your **personal cell phone** or an **existing business line**, set up **Conditional Call Forwarding** to your new AI Number.

### How to set up Call Forwarding:
1.  **Verizon/Sprint**: Dial `*71` + `[Your AI Number]` and press call.
2.  **AT&T/T-Mobile**: Dial `**61*` + `[Your AI Number]` + `#` and press call.
3.  **Test it**: Call your personal number from a different phone and let it ring. The AI should answer after a few seconds!
---

## 6. FAQ & Production Tips

### How do I change the AI's voice?
The agent uses **Cartesia** for ultra-fast, realistic speech. To change the voice:
1.  Browse the [Cartesia Voice Library](https://play.cartesia.ai/library).
2.  Copy the **Voice ID** of a "Sonic" voice you like.
3.  Add it to your `.env` file: `CARTESIA_VOICE_ID="your-voice-id"`.
4.  Restart the agent.

### Is running the agent on my local machine stable for customers?
While perfect for development and testing, **local hosting is not recommended for production** because:
*   **Reliability**: If your home internet or power drops, the receptionist goes offline.
*   **Maintenance**: Windows updates or computer sleep mode will stop the agent.
*   **Latency**: Home networks often have higher "jitter" than data centers.

**Production Recommendation**: Move your `agent/` folder to a cloud provider like **Railway.app**, **Render**, or a **VPS** (DigitalOcean/AWS). This ensures 99.9% uptime and the lowest possible latency for your customers.
