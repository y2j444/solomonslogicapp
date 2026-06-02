import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Uses GPT-4o-mini to auto-generate a knowledge base and call handling rules
 * for a new customer based on their business name and phone number.
 */
export async function generateAIConfig(
  businessName: string,
  businessPhone: string
): Promise<{ knowledgeBase: string; callHandlingRules: string }> {
  console.log(`[AI Config] Generating config for: ${businessName}`);

  const prompt = `You are setting up an AI phone receptionist named Sara for a local Nashville, TN service business.

Business Name: ${businessName}
Business Phone: ${businessPhone}

Based ONLY on the business name, infer the most likely industry (e.g., plumbing, HVAC, roofing, landscaping, medspa, electrical, etc.) and generate two things:

1. KNOWLEDGE_BASE: A knowledge base that Sara will use to answer calls. Include:
   - Business name and inferred industry/services
   - Assumed business hours (Mon-Fri 8am-6pm, Sat 9am-2pm, emergency after hours)
   - Common services for that industry (list 5-8)
   - Emergency availability (most service businesses offer 24/7 emergency)
   - Pricing: always say "Free estimates, please call to schedule"
   - How to reach the owner if urgent: say they are in the field and Sara is taking calls

2. CALL_HANDLING_RULES: Specific instructions for how Sara should handle calls:
   - Always try to book an appointment before ending the call
   - Collect: caller's full name, phone number, address, and nature of the problem
   - For emergencies, treat as high priority and say owner will call back within 15 minutes
   - Do NOT quote exact prices — always say "free estimate"
   - Be warm, professional, and local-Nashville-friendly
   - If caller asks to speak to someone directly, say the owner is currently on a job and you're taking their calls

Respond in this EXACT format with no extra text:
KNOWLEDGE_BASE:
[knowledge base here]

CALL_HANDLING_RULES:
[call handling rules here]`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
    temperature: 0.4,
  });

  const text = response.choices[0].message.content || "";

  const kbMatch = text.match(/KNOWLEDGE_BASE:\n([\s\S]*?)(?=\n\nCALL_HANDLING_RULES:|$)/);
  const rulesMatch = text.match(/CALL_HANDLING_RULES:\n([\s\S]*?)$/);

  const knowledgeBase = kbMatch?.[1]?.trim() || `Business: ${businessName}\nHours: Mon-Fri 8am-6pm, Sat 9am-2pm\nServices: Please contact us for details\nEmergency: Available 24/7 for urgent calls`;
  const callHandlingRules = rulesMatch?.[1]?.trim() || `- Always try to book an appointment\n- Collect caller name, phone, and reason for calling\n- Do not quote exact prices — say "free estimate"\n- Be professional and friendly`;

  console.log(`[AI Config] ✅ Generated config for ${businessName}`);
  return { knowledgeBase, callHandlingRules };
}
