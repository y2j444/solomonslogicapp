import * as dotenv from 'dotenv';
dotenv.config();

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;

if (!TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY not set');
  process.exit(1);
}

async function listConnections() {
  console.log('Fetching Telnyx TeXML Applications...');
  const res = await fetch('https://api.telnyx.com/v2/texml_applications', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      Accept: 'application/json'
    }
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Error fetching applications:', json);
    return;
  }

  const apps = json.data;
  if (!apps || apps.length === 0) {
    console.log('No Call Control Applications found on this account.');
    return;
  }

  console.log(`Found ${apps.length} applications:`);
  for (const app of apps) {
    console.log(`- Name: ${app.application_name}`);
    console.log(`  ID: ${app.id}`);
  }
}

listConnections();
