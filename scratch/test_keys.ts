import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

function parseEnv(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key) env[key] = val;
    }
  });
  return env;
}

async function testKey(name: string, key: string | undefined) {
  if (!key) {
    console.log(`❓ ${name}: Key is not set`);
    return;
  }
  console.log(`Testing ${name}: ${key.substring(0, 15)}...${key.substring(key.length - 5)}`);
  const client = new OpenAI({ apiKey: key });
  try {
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hello' }],
      max_tokens: 5,
    });
    console.log(`✅ ${name} works! Response: ${r.choices[0].message.content}`);
  } catch (e: any) {
    console.log(`❌ ${name} failed: ${e.message}`);
  }
}

async function main() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');

  const env = parseEnv(envPath);
  const envLocal = parseEnv(envLocalPath);

  await testKey('.env key', env.OPENAI_API_KEY);
  await testKey('.env.local key', envLocal.OPENAI_API_KEY);
}

main();
