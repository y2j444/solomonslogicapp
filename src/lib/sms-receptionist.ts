import {
  ContactStatus,
  LeadStage,
  type Contact,
  type SmsMessage,
  type User,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SmsContext = {
  user: User;
  contact: Contact;
  inbound: string;
  recentMessages: SmsMessage[];
};

type SmsDecision = {
  replyText: string;
  contactUpdates?: Partial<Contact>;
  createOrUpdateLead?: {
    leadTitle: string;
    stage: LeadStage;
    note: string;
  };
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function extractName(message: string) {
  const match = message.match(
    /\b(?:my name is|this is|i am|i'm)\s+([a-z][a-z .'-]{1,40})/i
  );

  if (!match) return null;

  return match[1]
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function containsAny(message: string, terms: string[]) {
  return terms.some((term) => message.includes(term));
}

function looksLikeTimeRequest(message: string) {
  return /(?:\bmon(?:day)?|\btue(?:s|sday)?|\bwed(?:nesday)?|\bthu(?:rs|rsday)?|\bfri(?:day)?|\bsat(?:urday)?|\bsun(?:day)?|\btomorrow\b|\btoday\b|\bnext week\b|\bnext\b|\b\d{1,2}[/:]\d{2}\b|\b\d{1,2}\s?(?:am|pm)\b|\bmorning\b|\bafternoon\b|\bevening\b)/i.test(
    message
  );
}

function summarizeHistory(messages: SmsMessage[]) {
  return messages
    .slice(0, 6)
    .map((message) => `${message.role}: ${message.message}`)
    .join("\n");
}

async function upsertSmsLead(
  userId: string,
  contactId: string,
  input: { leadTitle: string; stage: LeadStage; note: string }
) {
  const existing = await prisma.lead.findFirst({
    where: {
      ownerUserId: userId,
      contactId,
      source: "SMS",
      stage: {
        notIn: [LeadStage.Won, LeadStage.Lost],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    const notes = [existing.notes, input.note].filter(Boolean).join("\n\n");
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        leadTitle: existing.leadTitle || input.leadTitle,
        stage: input.stage,
        notes,
      },
    });
    return;
  }

  await prisma.lead.create({
    data: {
      leadTitle: input.leadTitle,
      stage: input.stage,
      source: "SMS",
      notes: input.note,
      contactId,
      ownerUserId: userId,
    },
  });
}

function buildDecision({
  user,
  contact,
  inbound,
  recentMessages,
}: SmsContext): SmsDecision {
  const text = normalizeText(inbound);
  const businessName = user.businessName?.trim() || "our team";
  const hoursText = process.env.BUSINESS_HOURS_TEXT?.trim();
  const extractedName = extractName(inbound);
  const lastOutbound =
    recentMessages.find((message) => message.role === "Outbound")?.message.toLowerCase() ??
    "";
  const historySummary = summarizeHistory(recentMessages);

  if (["stop", "unsubscribe", "cancel", "end", "quit"].includes(text)) {
    return {
      replyText: `You have been unsubscribed from ${businessName} text messages. Reply START to opt back in.`,
      contactUpdates: {
        status: ContactStatus.Inactive,
        notes: [contact.notes, "SMS opt-out requested by contact."]
          .filter(Boolean)
          .join("\n"),
      },
    };
  }

  if (["start", "unstop"].includes(text)) {
    return {
      replyText: `You are back on the ${businessName} text line. Tell us if you need scheduling, pricing, or a callback.`,
      contactUpdates: {
        status: ContactStatus.Active,
        notes: [contact.notes, "SMS opt-in resumed by contact."]
          .filter(Boolean)
          .join("\n"),
      },
    };
  }

  if (containsAny(text, ["book", "schedule", "appointment", "available", "availability"])) {
    const preferredTime = looksLikeTimeRequest(inbound);
    return {
      replyText: preferredTime
        ? `Thanks, I noted that timing for ${businessName}. A team member will confirm the appointment window shortly.`
        : `Happy to help with scheduling for ${businessName}. Text your preferred day and time, and we will line up the appointment.`,
      contactUpdates:
        extractedName && contact.fullName === contact.phone
          ? { fullName: extractedName, status: ContactStatus.Active }
          : { status: ContactStatus.Active },
      createOrUpdateLead: {
        leadTitle: `SMS appointment request from ${extractedName ?? contact.fullName}`,
        stage: LeadStage.Contacted,
        note: preferredTime
          ? `Appointment timing requested by SMS.\nMessage: ${inbound}\n\nRecent SMS history:\n${historySummary}`
          : `Contact asked to schedule by SMS and needs follow-up for day/time.\nMessage: ${inbound}\n\nRecent SMS history:\n${historySummary}`,
      },
    };
  }

  if (containsAny(text, ["quote", "estimate", "pricing", "price", "cost", "how much"])) {
    return {
      replyText: `I can help with that. Text a short description of the service you need and any timing details, and ${businessName} can send the next steps.`,
      contactUpdates:
        extractedName && contact.fullName === contact.phone
          ? { fullName: extractedName, status: ContactStatus.Active }
          : { status: ContactStatus.Active },
      createOrUpdateLead: {
        leadTitle: `SMS quote request from ${extractedName ?? contact.fullName}`,
        stage: LeadStage.Contacted,
        note: `Pricing or estimate requested by SMS.\nMessage: ${inbound}\n\nRecent SMS history:\n${historySummary}`,
      },
    };
  }

  if (containsAny(text, ["person", "human", "call me", "callback", "speak to someone", "someone call"])) {
    return {
      replyText: `Understood. I've flagged this for the ${businessName} team and someone should follow up with you shortly.`,
      contactUpdates:
        extractedName && contact.fullName === contact.phone
          ? { fullName: extractedName, status: ContactStatus.Active }
          : { status: ContactStatus.Active },
      createOrUpdateLead: {
        leadTitle: `SMS callback request from ${extractedName ?? contact.fullName}`,
        stage: LeadStage.Contacted,
        note: `Requested human follow-up by SMS.\nMessage: ${inbound}\n\nRecent SMS history:\n${historySummary}`,
      },
    };
  }

  if (containsAny(text, ["hours", "open", "closing", "close", "when are you open"])) {
    return {
      replyText: hoursText
        ? `${businessName} hours: ${hoursText}`
        : `Thanks for texting ${businessName}. A team member can confirm hours shortly. If you want to book time, text your preferred day and time.`,
      contactUpdates:
        extractedName && contact.fullName === contact.phone
          ? { fullName: extractedName, status: ContactStatus.Active }
          : undefined,
    };
  }

  if (containsAny(text, ["thanks", "thank you"])) {
    return {
      replyText: `You're welcome. If you need scheduling, pricing, or a callback from ${businessName}, just text me here.`,
      contactUpdates:
        extractedName && contact.fullName === contact.phone
          ? { fullName: extractedName }
          : undefined,
    };
  }

  if (
    lastOutbound.includes("preferred day and time") ||
    lastOutbound.includes("service you need")
  ) {
    return {
      replyText: `Thanks, I've added that to your conversation with ${businessName}. A team member will review it and follow up shortly.`,
      contactUpdates:
        extractedName && contact.fullName === contact.phone
          ? { fullName: extractedName, status: ContactStatus.Active }
          : { status: ContactStatus.Active },
      createOrUpdateLead: {
        leadTitle: `SMS follow-up from ${extractedName ?? contact.fullName}`,
        stage: LeadStage.Contacted,
        note: `Customer replied to an SMS follow-up prompt.\nMessage: ${inbound}\n\nRecent SMS history:\n${historySummary}`,
      },
    };
  }

  return {
    replyText: `Thanks for texting ${businessName}. I can help with scheduling, pricing questions, or getting a team member to follow up. Tell me what you need.`,
    contactUpdates:
      extractedName && contact.fullName === contact.phone
        ? { fullName: extractedName, status: ContactStatus.Active }
        : undefined,
  };
}

export async function handleSmsReceptionist(input: SmsContext) {
  const decision = buildDecision(input);

  if (decision.contactUpdates && Object.keys(decision.contactUpdates).length > 0) {
    await prisma.contact.update({
      where: { id: input.contact.id },
      data: decision.contactUpdates,
    });
  }

  if (decision.createOrUpdateLead) {
    await upsertSmsLead(input.user.id, input.contact.id, decision.createOrUpdateLead);
  }

  return decision.replyText;
}
