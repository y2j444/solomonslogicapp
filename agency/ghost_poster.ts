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
  // Safety check: Ghost only runs on the local machine where Chrome is installed
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "[Ghost] Error: The Social Ghost is a 'Local Agent'. For security, it must run from your local terminal or local dev environment to access your saved accounts.";
  }

  console.log(`[Ghost] Starting automated post to ${platform}...`);
  
  const context = await chromium.launchPersistentContext(PROFILE_PATH, {
    headless: false,
    channel: "chrome",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
    ],
  });

  const page = await context.newPage();

  try {
    if (platform === "linkedin") {
      await page.goto("https://www.linkedin.com/feed/", { waitUntil: "load" });
      await page.waitForTimeout(7000); // More time for popups to appear
      
      const postTrigger = page.locator('button:has-text("Start a post"), .share-mb-trigger, [data-control-name="share_placeholder"], [data-view-name="share-box-trigger"], [aria-label="Start a post"]');
      await postTrigger.first().waitFor({ state: "visible", timeout: 10000 });
      await postTrigger.first().click({ force: true });
      
      const editor = page.locator('.ql-editor, [role="textbox"]');
      await editor.first().waitFor({ state: "visible" });
      await editor.first().fill(content);
      
      const publishBtn = page.locator('button:has-text("Post"), .share-actions__primary-action');
      await publishBtn.waitFor({ state: "visible" });
      await publishBtn.click();
      return "[Ghost] LinkedIn post successful!";
    } else if (platform === "facebook") {
      await page.goto("https://www.facebook.com");
      // Look for the "What's on your mind" area
      await page.click('div[role="button"]:has-text("mind"), div[role="button"]:has-text("Post")');
      await page.fill('div[role="textbox"]', content);
      await page.click('div[role="button"]:has-text("Post")');
      return "[Ghost] Facebook post successful!";
    } else if (platform === "google") {
      await page.goto("https://www.google.com/search?q=my+business");
      // Google search direct edit buttons
      const editBtn = page.locator('div:has-text("Edit profile"), button:has-text("Edit profile"), [aria-label*="Edit profile"]');
      await editBtn.first().click();
      return "[Ghost] Navigated to Google Edit screen. Please verify the description.";
    }
    return "[Ghost] Platform not recognized.";
  } catch (err: any) {
    console.error(`[Ghost] Error posting to ${platform}:`, err);
    return `[Ghost] Error: ${err.message}`;
  } finally {
    await context.close();
  }
}

export async function ghostUpdateDescription(platform: "google", content: string) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "[Ghost] Error: Ghost updates must be run locally.";
  }

  console.log(`[Ghost] Updating ${platform} profile description for SEO...`);
  const context = await chromium.launchPersistentContext(PROFILE_PATH, {
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  const page = await context.newPage();
  try {
    if (platform === "google") {
      await page.goto("https://www.google.com/search?q=my+business", { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(3000);
      const editBtn = page.locator('div:has-text("Edit profile"), [aria-label="Edit profile"], button:has-text("Edit profile")');
      await editBtn.first().waitFor();
      await editBtn.first().click();
      // Wait for the modal/panel to appear
      await page.waitForTimeout(1000);
      await page.click('div:has-text("Description"), [aria-label="Edit Description"]');
      const textarea = page.locator('textarea');
      await textarea.waitFor();
      await textarea.fill(content);
      await page.click('span:has-text("Save")');
      return "[Ghost] Google Business Profile description updated successfully! SEO boost incoming.";
    }
    return "[Ghost] Platform not supported for description updates yet.";
  } catch (err: any) {
    console.error(`[Ghost] Error updating ${platform}:`, err);
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
    const result = await ghostPost(platform, content);
    console.log(result);
  } else if (mode === "update-desc") {
    const platform = process.argv[3] as any;
    const content = process.argv[4];
    const result = await ghostUpdateDescription(platform, content);
    console.log(result);
  } else {
    console.log("Usage: tsx agency/ghost_poster.ts [login|post|update-desc] [platform] [content]");
  }
}

if (process.argv[1]?.includes("ghost_poster.ts")) {
  main().catch(console.error);
}
