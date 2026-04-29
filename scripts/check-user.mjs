import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'xboxmikej@gmail.com';
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        contacts: true,
        leads: true,
        appointments: true,
        callLogs: true,
        smsMessages: true,
      },
    });

    if (user) {
      console.log('--- User Profile ---');
      console.log(`Email: ${user.email}`);
      console.log(`Business Name: ${user.businessName}`);
      console.log(`Twilio Phone: ${user.twilioPhone}`);
      console.log(`Contacts: ${user.contacts.length}`);
      console.log(`Leads: ${user.leads.length}`);
      console.log(`Appointments: ${user.appointments.length}`);
      console.log(`Call Logs: ${user.callLogs.length}`);
      console.log(`SMS Messages: ${user.smsMessages.length}`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
