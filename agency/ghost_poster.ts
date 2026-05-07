import { chromium } from "playwright";
import path from "path";

const PROFILE_PATH = path.resolve(process.cwd(), "ghost_profile");

export async function ghostLogin() {
  console.log("[Ghost] Opening browser for manual login...");
  console.log("[Ghost] Please log in to LinkedIn, Facebook, and Google Business Profile.");
  
  const context = await chromium.launchPersistentContext(PROFILE_PATH, {
    headless: false,
    channel: "chrome", // Use real Chrome if installed
    viewport: { width: 1280, height: 800 },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
    ],
  });

  const page = await context.newPage();
  await page.goto("https://www.linkedin.com/login");
  
  const page2 = await context.newPage();
  await page2.goto("https://www.facebook.com");

  const page3 = await context.newPage();
  await page3.goto("https://business.google.com");

  console.log("[Ghost] Keep this window open until you are logged in. Close it when done.");
}

export async function ghostPost(platform: "linkedin" | "facebook" | "google", content: string) {
  console.log(`[Ghost] Starting automated post to ${platform}...`);
  
  const context = await chromium.launchPersistentContext(PROFILE_PATH, {
    headless: false, // Keep it visible for now so user can see the magic
  });

  const page = await context.newPage();

  try {
    if (platform === "linkedin") {
      await page.goto("https://www.linkedin.com/feed/");
      await page.click("button.share-mb-trigger");
      await page.fill("div.ql-editor", content);
      await page.click("button.share-actions__primary-action");
      return "[Ghost] LinkedIn post successful! Your update is live.";
    } else if (platform === "facebook") {
      await page.goto("https://www.facebook.com");
      await page.click('div[role="button"]:has-text("What\'s on your mind")');
      await page.fill('div[role="textbox"]', content);
      await page.click('div[role="button"]:has-text("Post")');
      return "[Ghost] Facebook post successful! Your update is live.";
    } else if (platform === "google") {
      await page.goto("https://business.google.com");
      await page.click('span:has-text("Create post")');
      await page.fill('textarea', content);
      await page.click('span:has-text("Publish")');
      return "[Ghost] Google Business post successful! Your update is live.";
    }
    return "[Ghost] Platform not recognized.";
  } catch (err: any) {
    console.error(`[Ghost] Error posting to ${platform}:`, err);
    return `[Ghost] Error: ${err.message}`;
  } finally {
    await context.close();
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode === "login") {
    await ghostLogin();
  } else if (mode === "post") {
    const platform = process.argv[3] as any;
    const content = process.argv[4];
    await ghostPost(platform, content);
  } else {
    console.log("Usage: tsx agency/ghost_poster.ts [login|post] [platform] [content]");
  }
}

if (process.argv[1]?.includes("ghost_poster.ts")) {
  main().catch(console.error);
}
