import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    const contactsCount = await prisma.contact.count();
    const leads = await prisma.lead.findMany({
      include: { contact: true }
    });
    const appointments = await prisma.appointment.findMany({
      include: { contact: true }
    });
    const callLogs = await prisma.callLog.findMany({
      orderBy: { calledAt: 'desc' },
      take: 10,
      include: { contact: true }
    });

    console.log("=== CRM PIPELINE REPORT ===");
    console.log(`Total Contacts: ${contactsCount}`);
    console.log(`Total Leads: ${leads.length}`);
    console.log(`Total Appointments: ${appointments.length}`);
    console.log(`Total Calls Registered: ${callLogs.length}\n`);

    console.log("--- RECENT INBOUND CALL RECORDS ---");
    callLogs.forEach((log, idx) => {
      console.log(`Call #${idx+1} | Date: ${log.calledAt.toISOString()}`);
      console.log(`Caller: ${log.callerPhone} | Name: ${log.contact?.fullName || 'Anonymous'}`);
      console.log(`Summary: ${log.aiSummary || 'No summary generated yet'}`);
      console.log(`Appointment Status: ${log.appointmentStatus}`);
      console.log("-----------------------------------------");
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
