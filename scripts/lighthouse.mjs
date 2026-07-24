import { spawn } from "node:child_process";
import { join } from "node:path";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";

const serverPort = 3000;
const baseUrl = `http://127.0.0.1:${String(serverPort)}`;
const routes = ["/th", "/th/stories", "/th/projects/lumixia-brief"];
const minimumScores = {
  accessibility: 1,
  "best-practices": 1,
  performance: 0.95,
  seo: 1,
};

const server = spawn(
  process.execPath,
  [join(process.cwd(), "node_modules", "next", "dist", "bin", "next"), "start", "--port", String(serverPort)],
  {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += String(chunk);
});
server.stderr.on("data", (chunk) => {
  serverOutput += String(chunk);
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/th`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
  throw new Error(`Next.js did not start in time.\n${serverOutput}`);
}

let chrome;
try {
  await waitForServer();
  const automaticChromePath =
    process.platform === "win32" ? undefined : chromium.executablePath();
  chrome = await chromeLauncher.launch({
    ...(process.env.CHROME_PATH
      ? { chromePath: process.env.CHROME_PATH }
      : automaticChromePath
        ? { chromePath: automaticChromePath }
        : {}),
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });

  const failures = [];
  for (const route of routes) {
    const result = await lighthouse(`${baseUrl}${route}`, {
      formFactor: "desktop",
      logLevel: "error",
      onlyCategories: Object.keys(minimumScores),
      output: "json",
      port: chrome.port,
      screenEmulation: { disabled: true },
    });
    if (!result) {
      failures.push(`${route}: Lighthouse returned no result.`);
      continue;
    }

    const scores = {};
    for (const [category, minimum] of Object.entries(minimumScores)) {
      const score = result.lhr.categories[category]?.score ?? 0;
      scores[category] = Math.round(score * 100);
      if (score < minimum) {
        failures.push(
          `${route}: ${category} ${String(Math.round(score * 100))} is below ${String(Math.round(minimum * 100))}.`,
        );
      }
    }
    console.log(`${route} ${JSON.stringify(scores)}`);
  }

  if (failures.length > 0) throw new Error(failures.join("\n"));
} finally {
  if (chrome) await chrome.kill();
  server.kill();
}
