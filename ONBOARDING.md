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

## 3. Using a Personal/Existing Number

If you want the AI to answer calls to your **personal cell phone** or an **existing business line**, you don't need to change your number. Simply set up **Conditional Call Forwarding**.

### How to set up Call Forwarding:
1.  Find your **AI Receptionist Number** in your Settings.
2.  On your personal phone, set up forwarding for missed calls:
    *   **Verizon/Sprint**: Dial `*71` + `[Your AI Number]` (e.g., `*716151234567`) and press call.
    *   **AT&T/T-Mobile**: Dial `**61*` + `[Your AI Number]` + `#` and press call.
3.  **Test it**: Call your personal number from a different phone and let it ring. The AI should answer after a few seconds!

---

## 4. How the AI Receptionist Works

1.  **Call Handling**: When a customer calls the assigned **AI Number** (or is forwarded there), Vapi answers using the user's **Business Name** for context.
2.  **Booking**: If the caller wants to schedule an appointment, Vapi calls the `/api/appointments` endpoint. 
    *   The system identifies the business using the incoming phone number.
3.  **Record Creation**: The CRM automatically creates a **Contact**, logs the **Call**, and schedules the **Appointment** under the correct company account.
