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
        console.log("Listing inbound trunks...");
        const trunks = await sipClient.listSipInboundTrunk();
        console.log("Current inbound trunks:", JSON.stringify(trunks, null, 2));
        
        if (trunks.length > 0) {
            const trunk = trunks[0];
            console.log(`Updating trunk ${trunk.sipTrunkId} to add inbound numbers...`);
            const updated = await sipClient.updateSipInboundTrunkFields(trunk.sipTrunkId, {
                numbers: {
                    set: ["+16157163328", "16157163328"]
                }
            });
            console.log("Successfully updated trunk:", JSON.stringify(updated, null, 2));
        } else {
            console.log("No inbound trunks found to update.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
