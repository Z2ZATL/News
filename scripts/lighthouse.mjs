import { spawn } from "node:child_process";
import { join } from "node:path";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { chromium } from "@playwright/test";

const serverPort = 4173;
const baseUrl = `http://127.0.0.1:${String(serverPort)}`;
const routes = process.env.LIGHTHOUSE_ROUTES?.split(",") ?? [
  "/th",
  "/th/stories",
  "/th/projects/lumixia-brief",
];
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
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before Lighthouse started.\n${serverOutput}`);
    }
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

async function runLighthouse(route, chromePath) {
  const auditUrl = new URL(route, baseUrl);
  auditUrl.searchParams.set("lighthouse", "1");
  const browser = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ["--headless=new", "--no-sandbox"],
  });
  try {
    return await lighthouse(
      auditUrl.toString(),
      {
        logLevel: "error",
        onlyCategories: Object.keys(minimumScores),
        output: "json",
        port: browser.port,
      },
      process.platform === "win32" && process.arch === "arm64"
        ? {
            ...desktopConfig,
            settings: {
              ...desktopConfig.settings,
              throttling: {
                ...desktopConfig.settings.throttling,
                cpuSlowdownMultiplier: 1,
              },
            },
          }
        : desktopConfig,
    );
  } finally {
    try {
      await browser.kill();
    } catch {
      // Windows can retain Edge profile files briefly after the process exits.
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1_500);
    });
  }
}

try {
  await waitForServer();
  const automaticChromePath = chromium.executablePath();
  const chromePath = process.env.CHROME_PATH ?? automaticChromePath;

  const failures = [];
  for (const route of routes) {
    const result = await runLighthouse(route, chromePath);
    if (!result) {
      failures.push(`${route}: Lighthouse returned no result.`);
      continue;
    }

    const scores = {};
    for (const [category, minimum] of Object.entries(minimumScores)) {
      const categoryResult = result.lhr.categories[category];
      if (categoryResult?.score === null) {
        const runtimeMessage = result.lhr.runtimeError?.message ?? "No runtime error reported.";
        failures.push(`${route}: ${category} did not produce a score. ${runtimeMessage}`);
        scores[category] = 0;
        continue;
      }
      const score = categoryResult?.score ?? 0;
      scores[category] = Math.round(score * 100);
      if (score < minimum) {
        failures.push(
          `${route}: ${category} ${String(Math.round(score * 100))} is below ${String(Math.round(minimum * 100))}.`,
        );
        const failedAudits = (categoryResult?.auditRefs ?? [])
          .filter(({ weight }) => weight > 0)
          .map(({ id, weight }) => ({
            audit: result.lhr.audits[id],
            weight,
          }))
          .filter(({ audit }) => audit && audit.score !== null && audit.score < 1)
          .sort((left, right) => right.weight - left.weight)
          .map(({ audit, weight }) => {
            const value = audit?.displayValue ? ` (${audit.displayValue})` : "";
            return `${audit?.id ?? "unknown"}=${String(Math.round((audit?.score ?? 0) * 100))}${value}, weight ${String(weight)}`;
          });
        console.log(
          `${route} ${category} failing audits: ${failedAudits.join("; ")}`,
        );
      }
    }
    console.log(`${route} ${JSON.stringify(scores)}`);
  }

  if (failures.length > 0) throw new Error(failures.join("\n"));
} finally {
  server.kill();
}
