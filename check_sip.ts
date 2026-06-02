import dotenv from "dotenv";
dotenv.config();

async function main() {
  const key = process.env.TELNYX_API_KEY;
  const res = await fetch("https://api.telnyx.com/v2/phone_numbers?filter[phone_number]=%2B16157163328", {
    headers: { Authorization: "Bearer " + key }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
