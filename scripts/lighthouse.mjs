import { spawn } from "node:child_process";
import { join } from "node:path";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import mobileConfig from "lighthouse/core/config/default-config.js";
import { chromium } from "@playwright/test";

const serverPort = 4173;
const baseUrl = `http://127.0.0.1:${String(serverPort)}`;
const routes = process.env.LIGHTHOUSE_ROUTES?.split(",") ?? [
  "/th",
  "/en",
  "/th/stories/okmd-ai-playground-review",
  "/en/stories/okmd-ai-playground-review",
  "/th/projects/lumixia-brief",
  "/en/projects/lumixia-brief",
];
const profiles = ["mobile", "desktop"];
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
    env: {
      ...process.env,
      CONTENT_SOURCE: "fixture",
      RATE_LIMIT_SECRET: "lighthouse-rate-limit-secret-32-bytes",
      REACTION_COOKIE_SECRET: "lighthouse-reaction-cookie-secret-32-bytes",
      REACTION_STORE: "memory",
    },
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

async function runLighthouse(route, chromePath, profile) {
  const auditUrl = new URL(route, baseUrl);
  auditUrl.searchParams.set("lighthouse", "1");
  const browser = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ["--headless=new", "--no-sandbox"],
  });
  const baseConfig = profile === "desktop" ? desktopConfig : mobileConfig;
  const useArmCpuWorkaround =
    process.platform === "win32" &&
    process.arch === "arm64" &&
    process.env.LIGHTHOUSE_FORCE_STANDARD_CPU !== "1";
  const config = useArmCpuWorkaround
    ? {
        ...baseConfig,
        settings: {
          ...baseConfig.settings,
          throttling: {
            ...baseConfig.settings.throttling,
            // Windows ARM already runs Chromium through an emulation layer.
            // Keep mobile network/screen emulation, but avoid stacking a 4x
            // CPU slowdown on top of host emulation. Linux CI retains the
            // standard Lighthouse mobile CPU profile.
            cpuSlowdownMultiplier: 1,
          },
        },
      }
    : baseConfig;
  try {
    return await lighthouse(
      auditUrl.toString(),
      {
        logLevel: "error",
        onlyCategories: Object.keys(minimumScores),
        output: "json",
        port: browser.port,
      },
      config,
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

async function runLighthouseWithTraceRetry(route, chromePath, profile) {
  const maximumAttempts = 3;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const result = await runLighthouse(route, chromePath, profile);
    const hasMissingCategory = Object.keys(minimumScores).some(
      (category) => result?.lhr.categories[category]?.score === null,
    );
    const retryable =
      hasMissingCategory && result?.lhr.runtimeError?.code === "NO_NAVSTART";
    if (!retryable || attempt === maximumAttempts) return result;
    console.log(
      `${profile} ${route} trace capture returned NO_NAVSTART; retrying (${String(attempt + 1)}/${String(maximumAttempts)}).`,
    );
  }
  return undefined;
}

try {
  await waitForServer();
  const automaticChromePath = chromium.executablePath();
  const chromePath = process.env.CHROME_PATH ?? automaticChromePath;

  const failures = [];
  for (const profile of profiles) {
    for (const route of routes) {
    const result = await runLighthouseWithTraceRetry(route, chromePath, profile);
    if (!result) {
      failures.push(`${profile} ${route}: Lighthouse returned no result.`);
      continue;
    }

    const scores = {};
    for (const [category, minimum] of Object.entries(minimumScores)) {
      const categoryResult = result.lhr.categories[category];
      if (categoryResult?.score === null) {
        const runtimeMessage = result.lhr.runtimeError?.message ?? "No runtime error reported.";
        failures.push(`${profile} ${route}: ${category} did not produce a score. ${runtimeMessage}`);
        scores[category] = 0;
        continue;
      }
      const score = categoryResult?.score ?? 0;
      scores[category] = Math.round(score * 100);
      if (score < minimum) {
        failures.push(
          `${profile} ${route}: ${category} ${String(Math.round(score * 100))} is below ${String(Math.round(minimum * 100))}.`,
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
            const samples = Array.isArray(audit?.details?.items)
              ? `, samples ${JSON.stringify(audit.details.items.slice(0, 3))}`
              : "";
            return `${audit?.id ?? "unknown"}=${String(Math.round((audit?.score ?? 0) * 100))}${value}, weight ${String(weight)}${samples}`;
          });
        console.log(
          `${profile} ${route} ${category} failing audits: ${failedAudits.join("; ")}`,
        );
        if (category === "performance") {
          for (const id of [
            "largest-contentful-paint-element",
            "lcp-breakdown-insight",
            "lcp-discovery-insight",
            "render-blocking-resources",
            "render-blocking-insight",
            "image-delivery-insight",
            "network-dependency-tree-insight",
            "server-response-time",
            "bootup-time",
            "long-tasks",
            "mainthread-work-breakdown",
            "unused-javascript",
          ]) {
            const diagnostic = result.lhr.audits[id];
            if (diagnostic) {
              console.log(`${profile} ${route} ${id}: ${JSON.stringify(diagnostic.details?.items?.slice(0, 5) ?? diagnostic.displayValue ?? diagnostic.score)}`);
            }
          }
        }
      }
    }
    console.log(`${profile} ${route} ${JSON.stringify(scores)}`);
    }
  }

  if (failures.length > 0) throw new Error(failures.join("\n"));
} finally {
  server.kill();
}
