# Solomon's Logic — CSO Conversation Log
**Purpose:** Permanent record of all decisions, instructions, and context so nothing is lost between sessions.  
**Log File:** `c:\SolomonsLogic\solomons-logic-ai-receptionist\reports\conversation_log.md`

---

## Session: May 28, 2026

### Mike's Instructions
- "Be a human CSO. Get 5 paying customers by end of June 2026 or you're fired."
- "Texts, phone calls, social media, emails — whatever it takes."
- "Monitor the site for signup issues and fix them."
- "Give me an EOD report every day."
- "Keep a conversation log so we don't lose context."
- "Get to work."

### Product Summary (as of today)
- **Product:** Solomon's Logic AI Receptionist — "Sara"
- **Demo number:** (615) 716-3328
- **Live at:** app.solomonslogic.com
- **Pricing:** $149/mo Starter | $299/mo Professional | $599/mo Growth
- **Infrastructure:** Next.js app on Vercel + LiveKit agent on Railway
- **STT:** Deepgram | **LLM:** OpenAI GPT-4o-mini | **TTS:** OpenAI nova
- **Call routing:** Telnyx SIP → LiveKit → Sara agent

### Key Technical Decisions Made
| Date | Decision | Reason |
|------|----------|--------|
| May 28 | Switched TTS Cartesia → OpenAI | Cartesia 10k free tier exhausted |
| May 28 | Reverted `dotenv override: true` | Was wiping Railway env vars on startup |
| May 28 | Raised barge-in threshold: 0 words → 3 words | Background noise triggering TTS abort crashes |
| May 28 | Suppressed `APIUserAbortError` | Expected during caller interruption; was crashing jobs |

### Active Leads in CRM (as of May 28)
| Business | Phone | Niche | Deal Value | Status |
|----------|-------|-------|------------|--------|
| Smooth Saling Plumbing | +16158151502 | Residential Plumbing | $2,400/yr | SMS sent |
| Morton Plumbing H&C | +16152552527 | Plumbing & HVAC | $3,200/yr | SMS sent |
| Wehby Plumbing | +16152557424 | Plumbing | $2,800/yr | SMS sent |
| Ona Skincare | +16158108785 | MedSpa | $4,500/yr | SMS sent |
| Nashville Skin Society | +16158668653 | Medical Aesthetics | $3,900/yr | SMS sent |

### Open Items / Needs Mike's Input
- [ ] **Stripe keys** — need `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to enable billing
- [ ] **Social media accounts** — Twitter/Instagram handles if Mike wants me to post there
- [ ] **Mike's personal cell** — for me to text him immediately when a lead replies

---

## Session Log will be updated each day below this line.

---
