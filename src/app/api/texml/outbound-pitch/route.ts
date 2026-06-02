import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return handleRequest(req);
}

export async function GET(req: Request) {
  return handleRequest(req);
}

async function handleRequest(req: Request) {
  // Use our standard LiveKit SIP URI so the AI agent picks it up
  const sipUri = "sip:3cxmt6y6y9q.sip.livekit.cloud";
  
  // We can add custom SIP headers to let the LiveKit agent know this is an outbound pitch
  // Telnyx supports adding headers via X- headers in the Sip string
  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>
        <Sip>${sipUri};X-Mode=outbound_pitch</Sip>
    </Dial>
</Response>`;

  return new NextResponse(xmlResponse, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
