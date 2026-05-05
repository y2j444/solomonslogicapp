import { NextResponse } from "next/server";

export async function POST() {
  return handleRequest();
}

export async function GET() {
  return handleRequest();
}

async function handleRequest() {
  const sipUri = "sip:3cxmt6y6y9q.sip.livekit.cloud";
  
  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>
        <Sip>${sipUri}</Sip>
    </Dial>
</Response>`;

  return new NextResponse(xmlResponse, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
