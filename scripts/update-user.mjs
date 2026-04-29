import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'xboxmikej@gmail.com';
  // EDIT THESE VALUES:
  const businessName = 'Hanks Pet Store';
  const twilioPhone = '+16155520319'; // <--- ENTER YOUR NEW TWILIO NUMBER HERE in E.164 format

  if (twilioPhone === '+1XXXXXXXXXX') {
    console.error('Error: Please edit scripts/update-user.mjs and enter your actual Twilio number.');
    process.exit(1);
  }

  try {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        businessName,
        twilioPhone,
      },
    });

    console.log('--- User Updated Successfully ---');
    console.log(`Email: ${updated.email}`);
    console.log(`Business Name: ${updated.businessName}`);
    console.log(`Twilio Phone: ${updated.twilioPhone}`);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
