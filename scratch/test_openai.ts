import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

const client = new OpenAI();

async function main() {
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Say exactly: SARA IS ONLINE AND READY' }],
    max_tokens: 10,
  });
  console.log('✅ OpenAI Key Valid:', r.choices[0].message.content);
}

main().catch((e) => {
  console.error('❌ OpenAI Key Failed:', e.message);
  process.exit(1);
});
