import { SipClient } from 'livekit-server-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const sipClient = new SipClient(
    process.env.LIVEKIT_URL || '',
    process.env.LIVEKIT_API_KEY || '',
    process.env.LIVEKIT_API_SECRET || ''
);

async function main() {
    try {
        console.log("Fetching SIP Dispatch Rules...");
        const rules = await sipClient.listSipDispatchRule();
        console.log("Dispatch Rules:", JSON.stringify(rules, null, 2));

        console.log("\nFetching SIP Trunks...");
        const trunks = await sipClient.listSipTrunk();
        console.log("SIP Trunks:", JSON.stringify(trunks, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
