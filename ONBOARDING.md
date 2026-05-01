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
    *   Our system (admin) then provisions a dedicated **AI Receptionist Number** (Twilio) for them.

---

## 2. Service Activation (System Level)

Since the company doesn't manage their own Twilio account, the activation process is handled by the Solomon's Logic platform:

1.  **AI Number Assignment**: An admin assigns a Twilio number to the user's `twilioPhone` field in the database.
2.  **Webhook Sync**: The system ensures the Twilio number is pointed to:
    *   **SMS**: `https://your-app-domain.com/api/webhooks/twilio/sms`
    *   **Voice**: `https://your-app-domain.com/api/webhooks/twilio/call`
3.  **Vapi Connection**: The assigned number is imported into Vapi and linked to the global **Assistant** configuration.

---

## 3. How the AI Receptionist Works

1.  **Call Handling**: When a customer calls the assigned **AI Number**, Vapi answers and handles the conversation using the user's **Business Name** for context.
2.  **Booking**: If the caller wants to schedule an appointment, Vapi calls the `/api/appointments` endpoint. 
    *   The system uses the incoming `phoneNumber` from Vapi to match the `twilioPhone` field in our database, identifying exactly which business the call belongs to.
3.  **Record Creation**: The CRM automatically creates a **Contact**, logs the **Call**, and schedules the **Appointment** under the correct company account.

---

## 4. Testing & Verification

*   **Settings Page**: The user can see their assigned **AI Receptionist Number** in their settings once it has been provisioned.
*   **Call Logs**: All interactions are visible in the `/call-logs` page for transparency and follow-up.
*   **Live Demo**: Admins can test the flow using the Vapi dashboard or by calling the assigned AI number directly.
