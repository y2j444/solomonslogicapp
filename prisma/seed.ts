import {
  AppointmentType,
  CallAppointmentStatus,
  CallDirection,
  ContactStatus,
  LeadStage,
  PrismaClient,
  SmsRole,
} from "@prisma/client";

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  twilioPhone: string;
};

// ... existing code ...

async function upsertUser(user: SeedUser) {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        twilioPhone: user.twilioPhone,
      },
    });
  }

  const existingByTwilioPhone = await prisma.user.findUnique({
    where: { twilioPhone: user.twilioPhone },
  });

  if (existingByTwilioPhone) {
    return prisma.user.update({
      where: { id: existingByTwilioPhone.id },
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
      },
    });
  }

  return prisma.user.create({
    data: user,
  });
}

// ... existing code ...
async function upsertContact(data: {
  ownerUserId: string;
  fullName: string;
  email?: string;
  phone: string;
  company?: string;
  status?: ContactStatus;
  notes?: string;
}) {
  const existing = await prisma.contact.findFirst({
    where: {
      ownerUserId: data.ownerUserId,
      phone: data.phone,
    },
  });

  if (existing) {
    return prisma.contact.update({
      where: { id: existing.id },
      data: {
        fullName: data.fullName,
        email: data.email ?? null,
        company: data.company ?? null,
        status: data.status ?? ContactStatus.Prospect,
        notes: data.notes ?? null,
      },
    });
  }

  return prisma.contact.create({
    data: {
      ownerUserId: data.ownerUserId,
      fullName: data.fullName,
      email: data.email ?? null,
      phone: data.phone,
      company: data.company ?? null,
      status: data.status ?? ContactStatus.Prospect,
      notes: data.notes ?? null,
    },
  });
}

async function upsertLead(data: {
  ownerUserId: string;
  contactId?: string;
  leadTitle: string;
  stage: LeadStage;
  dealValue: number;
  source?: string;
  notes?: string;
}) {
  const existing = await prisma.lead.findFirst({
    where: {
      ownerUserId: data.ownerUserId,
      leadTitle: data.leadTitle,
    },
  });

  if (existing) {
    return prisma.lead.update({
      where: { id: existing.id },
      data: {
        contactId: data.contactId ?? null,
        stage: data.stage,
        dealValue: data.dealValue,
        source: data.source ?? null,
        notes: data.notes ?? null,
      },
    });
  }

  return prisma.lead.create({
    data: {
      ownerUserId: data.ownerUserId,
      contactId: data.contactId ?? null,
      leadTitle: data.leadTitle,
      stage: data.stage,
      dealValue: data.dealValue,
      source: data.source ?? null,
      notes: data.notes ?? null,
    },
  });
}

async function upsertAppointment(data: {
  ownerUserId: string;
  contactId?: string;
  title: string;
  startTime: Date;
  durationMinutes: number;
  type: AppointmentType;
  notes?: string;
}) {
  const existing = await prisma.appointment.findFirst({
    where: {
      ownerUserId: data.ownerUserId,
      title: data.title,
    },
  });

  if (existing) {
    return prisma.appointment.update({
      where: { id: existing.id },
      data: {
        contactId: data.contactId ?? null,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        type: data.type,
        notes: data.notes ?? null,
      },
    });
  }

  return prisma.appointment.create({
    data: {
      ownerUserId: data.ownerUserId,
      contactId: data.contactId ?? null,
      title: data.title,
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
      type: data.type,
      notes: data.notes ?? null,
    },
  });
}

async function upsertCallLog(data: {
  ownerUserId: string;
  contactId?: string;
  callerPhone: string;
  callSid: string;
  durationSeconds: number;
  direction: CallDirection;
  aiSummary?: string;
  appointmentStatus?: CallAppointmentStatus;
}) {
  return prisma.callLog.upsert({
    where: { callSid: data.callSid },
    update: {
      ownerUserId: data.ownerUserId,
      contactId: data.contactId ?? null,
      callerPhone: data.callerPhone,
      durationSeconds: data.durationSeconds,
      direction: data.direction,
      aiSummary: data.aiSummary ?? null,
      appointmentStatus: data.appointmentStatus ?? CallAppointmentStatus.PendingReview,
    },
    create: {
      ownerUserId: data.ownerUserId,
      contactId: data.contactId ?? null,
      callerPhone: data.callerPhone,
      callSid: data.callSid,
      durationSeconds: data.durationSeconds,
      direction: data.direction,
      aiSummary: data.aiSummary ?? null,
      appointmentStatus: data.appointmentStatus ?? CallAppointmentStatus.PendingReview,
    },
  });
}

async function createSmsIfMissing(data: {
  ownerUserId: string;
  contactId?: string;
  phone: string;
  message: string;
  role: SmsRole;
}) {
  const existing = await prisma.smsMessage.findFirst({
    where: {
      ownerUserId: data.ownerUserId,
      phone: data.phone,
      message: data.message,
    },
  });

  if (existing) return existing;

  return prisma.smsMessage.create({
    data: {
      ownerUserId: data.ownerUserId,
      contactId: data.contactId ?? null,
      phone: data.phone,
      message: data.message,
      role: data.role,
    },
  });
}

async function main() {
  const owner = await upsertUser({
    email: "michael.janico@solomonslogic.com",
    firstName: "Michael",
    lastName: "Janico",
    businessName: "Solomon's Logic",
    twilioPhone: "+15550000001",
  });

  const brightCareUser = await upsertUser({
    email: "owner@brightcaredental.com",
    firstName: "Sarah",
    lastName: "Mills",
    businessName: "BrightCare Dental",
    twilioPhone: "+15550000002",
  });

  const peakFlowUser = await upsertUser({
    email: "owner@peakflowplumbing.com",
    firstName: "Daniel",
    lastName: "Reed",
    businessName: "PeakFlow Plumbing",
    twilioPhone: "+15550000003",
  });

  const now = new Date();

  const brightCareAsOwnerContact = await upsertContact({
    ownerUserId: owner.id,
    fullName: "BrightCare Dental",
    email: "owner@brightcaredental.com",
    phone: "+15550110001",
    company: "BrightCare Dental",
    status: ContactStatus.Active,
    notes: "SaaS customer using Solomon's Logic AI receptionist.",
  });

  const peakFlowAsOwnerContact = await upsertContact({
    ownerUserId: owner.id,
    fullName: "PeakFlow Plumbing",
    email: "owner@peakflowplumbing.com",
    phone: "+15550110002",
    company: "PeakFlow Plumbing",
    status: ContactStatus.Active,
    notes: "SaaS customer using Solomon's Logic for call handling.",
  });

  const northstarAsOwnerContact = await upsertContact({
    ownerUserId: owner.id,
    fullName: "Northstar Wellness",
    email: "admin@northstarwellness.com",
    phone: "+15550110003",
    company: "Northstar Wellness",
    status: ContactStatus.Prospect,
    notes: "Potential SaaS customer evaluating AI receptionist.",
  });

  await upsertLead({
    ownerUserId: owner.id,
    contactId: brightCareAsOwnerContact.id,
    leadTitle: "BrightCare Dental onboarding",
    stage: LeadStage.Qualified,
    dealValue: 1200,
    source: "Website",
    notes: "Interested in booking automation and missed-call handling.",
  });

  await upsertLead({
    ownerUserId: owner.id,
    contactId: peakFlowAsOwnerContact.id,
    leadTitle: "PeakFlow Plumbing expansion",
    stage: LeadStage.Proposal,
    dealValue: 2400,
    source: "Referral",
    notes: "Considering additional AI receptionist workflows.",
  });

  await upsertLead({
    ownerUserId: owner.id,
    contactId: northstarAsOwnerContact.id,
    leadTitle: "Northstar Wellness demo",
    stage: LeadStage.New,
    dealValue: 900,
    source: "Cold outreach",
    notes: "Needs a demo before deciding.",
  });

  await upsertAppointment({
    ownerUserId: owner.id,
    contactId: brightCareAsOwnerContact.id,
    title: "BrightCare Dental onboarding call",
    startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24),
    durationMinutes: 30,
    type: AppointmentType.Demo,
    notes: "Walk through AI receptionist booking flow.",
  });

  await upsertAppointment({
    ownerUserId: owner.id,
    contactId: peakFlowAsOwnerContact.id,
    title: "PeakFlow Plumbing renewal review",
    startTime: new Date(now.getTime() + 1000 * 60 * 60 * 48),
    durationMinutes: 45,
    type: AppointmentType.FollowUp,
    notes: "Review call volume and renewal options.",
  });

  await upsertCallLog({
    ownerUserId: owner.id,
    contactId: brightCareAsOwnerContact.id,
    callerPhone: "+15550110001",
    callSid: "seed_call_owner_brightcare_001",
    durationSeconds: 180,
    direction: CallDirection.Inbound,
    aiSummary: "BrightCare Dental called to confirm onboarding setup.",
    appointmentStatus: CallAppointmentStatus.AppointmentCreated,
  });

  await upsertCallLog({
    ownerUserId: owner.id,
    contactId: peakFlowAsOwnerContact.id,
    callerPhone: "+15550110002",
    callSid: "seed_call_owner_peakflow_001",
    durationSeconds: 240,
    direction: CallDirection.Outbound,
    aiSummary: "Follow-up call about renewal and service expansion.",
    appointmentStatus: CallAppointmentStatus.PendingReview,
  });

  await createSmsIfMissing({
    ownerUserId: owner.id,
    contactId: peakFlowAsOwnerContact.id,
    phone: "+15550110002",
    message: "Can we reschedule our onboarding review for tomorrow?",
    role: SmsRole.Inbound,
  });

  const brightCarePatient = await upsertContact({
    ownerUserId: brightCareUser.id,
    fullName: "Lisa Carter",
    email: "lisa.carter@example.com",
    phone: "+15550220001",
    company: "BrightCare Dental Patient",
    status: ContactStatus.Active,
    notes: "Sample patient/customer for BrightCare Dental.",
  });

  await upsertLead({
    ownerUserId: brightCareUser.id,
    contactId: brightCarePatient.id,
    leadTitle: "Teeth whitening consultation",
    stage: LeadStage.Contacted,
    dealValue: 350,
    source: "Phone",
    notes: "Patient requested pricing and availability.",
  });

  await upsertAppointment({
    ownerUserId: brightCareUser.id,
    contactId: brightCarePatient.id,
    title: "Lisa Carter consultation",
    startTime: new Date(now.getTime() + 1000 * 60 * 60 * 30),
    durationMinutes: 45,
    type: AppointmentType.Meeting,
    notes: "Consultation booked through receptionist flow.",
  });

  await upsertCallLog({
    ownerUserId: brightCareUser.id,
    contactId: brightCarePatient.id,
    callerPhone: "+15550220001",
    callSid: "seed_call_brightcare_patient_001",
    durationSeconds: 210,
    direction: CallDirection.Inbound,
    aiSummary: "Patient called to ask about appointment availability.",
    appointmentStatus: CallAppointmentStatus.AppointmentCreated,
  });

  const peakFlowCustomer = await upsertContact({
    ownerUserId: peakFlowUser.id,
    fullName: "Marcus Bennett",
    email: "marcus.bennett@example.com",
    phone: "+15550330001",
    company: "Residential Customer",
    status: ContactStatus.Active,
    notes: "Sample plumbing customer for PeakFlow Plumbing.",
  });

  await upsertLead({
    ownerUserId: peakFlowUser.id,
    contactId: peakFlowCustomer.id,
    leadTitle: "Emergency plumbing service follow-up",
    stage: LeadStage.Qualified,
    dealValue: 900,
    source: "Phone",
    notes: "Customer needs emergency service follow-up.",
  });

  await upsertAppointment({
    ownerUserId: peakFlowUser.id,
    contactId: peakFlowCustomer.id,
    title: "Emergency service estimate",
    startTime: new Date(now.getTime() + 1000 * 60 * 60 * 36),
    durationMinutes: 60,
    type: AppointmentType.FollowUp,
    notes: "Estimate appointment created from inbound call.",
  });

  await upsertCallLog({
    ownerUserId: peakFlowUser.id,
    contactId: peakFlowCustomer.id,
    callerPhone: "+15550330001",
    callSid: "seed_call_peakflow_customer_001",
    durationSeconds: 300,
    direction: CallDirection.Inbound,
    aiSummary: "Customer called about a leaking water heater.",
    appointmentStatus: CallAppointmentStatus.AppointmentCreated,
  });
}

main()
  .then(async () => {
    console.log("Seed data created successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });