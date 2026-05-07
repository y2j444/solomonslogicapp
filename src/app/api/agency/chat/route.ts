import { NextResponse } from "next/server";
import { runAgencyTask } from "../../../../../agency/pm";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log(`[API] Agency Chat Request: ${message}`);
    
    const response = await runAgencyTask(message);
    
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("[API] Agency Chat Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
