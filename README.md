This is the new Solomons Logic CRM codebase migrated off Zite.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

Implemented pages:
- Dashboard
- Contacts
- Leads
- Appointments
- Call Logs
- AI Receptionist

Implemented API routes:
- `/api/dashboard`
- `/api/contacts`
- `/api/leads`
- `/api/appointments`
- `/api/call-logs`
- `/api/users/profile`
- `/api/webhooks/vapi/book`
- `/api/webhooks/twilio/sms`
- `/api/webhooks/twilio/call`

Storage now uses Prisma models in `prisma/schema.prisma`.
Auth now supports Clerk via `@clerk/nextjs` with a local demo fallback.

## Phase 2 setup

1. Copy `.env.example` to `.env.local`
2. Set `DATABASE_URL` to your Supabase Postgres connection string
3. Run:
   - `npx prisma generate`
   - `npx prisma db push`
4. Run `npm run dev`
