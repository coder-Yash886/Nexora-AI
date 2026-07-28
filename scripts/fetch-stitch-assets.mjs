#!/usr/bin/env node
/**
 * Fetch HTML and screenshot from a Google Stitch project screen.
 * Requires STITCH_API_KEY (get one at https://stitch.withgoogle.com/settings)
 *
 * Usage:
 *   STITCH_API_KEY=sk_... node scripts/fetch-stitch-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StitchToolClient } from "@google/stitch-sdk";

const PROJECT_ID = "17770974233045929971";
const SCREEN_ID = "bc86fe5e44bd485689b732e6e9aebb58";
const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", ".stitch", "designs");

const apiKey = process.env.STITCH_API_KEY;
if (!apiKey) {
  console.error("Missing STITCH_API_KEY. Create one at https://stitch.withgoogle.com/settings");
  process.exit(1);
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  console.log(`Saved ${dest}`);
}

const client = new StitchToolClient({ apiKey });

try {
  const result = await client.callTool("get_screen", {
    projectId: PROJECT_ID,
    screenId: SCREEN_ID,
  });

  const screen = result?.screen ?? result;
  const htmlUrl = screen?.htmlCode?.downloadUrl ?? screen?.htmlCode?.uri;
  const imageUrl = screen?.screenshot?.downloadUrl ?? screen?.screenshot?.uri;

  if (!htmlUrl || !imageUrl) {
    console.error("Unexpected response:", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  await download(htmlUrl, join(OUTPUT_DIR, "nexora-ai-light-mode.html"));
  await download(imageUrl, join(OUTPUT_DIR, "nexora-ai-light-mode.png"));

  await writeFile(
    join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify({ projectId: PROJECT_ID, screenId: SCREEN_ID, htmlUrl, imageUrl }, null, 2)
  );

  console.log("Done.");
} catch (error) {
  console.error(error.message ?? error);
  process.exit(1);
} finally {
  await client.close();
}
