import * as dotenv from 'dotenv';
dotenv.config();

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const APP_ID = '2953199185354032558';
const WEBHOOK_URL = 'https://app.solomonslogic.com/api/texml/outbound-pitch';

if (!TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY not set');
  process.exit(1);
}

async function updateTexmlApp() {
  console.log(`Updating TeXML Application ${APP_ID}...`);
  const res = await fetch(`https://api.telnyx.com/v2/texml_applications/${APP_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      voice_url: WEBHOOK_URL,
      voice_method: 'POST'
    })
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Error updating TeXML application:', JSON.stringify(json, null, 2));
    
    // Maybe it's a Call Control App? Let's try that endpoint.
    console.log('Trying Call Control Applications endpoint instead...');
    const ccRes = await fetch(`https://api.telnyx.com/v2/call_control_applications/${APP_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        webhook_event_url: WEBHOOK_URL
      })
    });
    
    const ccJson = await ccRes.json();
    if (!ccRes.ok) {
      console.error('Error updating Call Control application:', JSON.stringify(ccJson, null, 2));
      return;
    }
    console.log('Successfully updated Call Control Application!', ccJson.data);
    return;
  }

  console.log('Successfully updated TeXML Application!', json.data);
}

updateTexmlApp();
