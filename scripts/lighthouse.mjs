import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
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
const profiles = process.env.LIGHTHOUSE_PROFILES?.split(",") ?? ["mobile", "desktop"];
const minimumScores = {
  accessibility: 1,
  "best-practices": 1,
  performance: 0.95,
  seo: 1,
};
const maximumScoreAttempts = 5;

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
  const userDataDir = await mkdtemp(join(tmpdir(), "z2zs-lighthouse-"));
  let browser;
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
    browser = await chromeLauncher.launch({
      chromePath,
      chromeFlags: ["--headless=new", "--no-sandbox"],
      // chrome-launcher's automatic cleanup can race the final Chromium process
      // on Windows ARM and throw an uncaught EPERM. Owning the directory lets us
      // wait for process release and retry cleanup without weakening the audit.
      userDataDir,
    });
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
    if (browser) {
      try {
        await browser.kill();
      } catch {
        // Windows can retain Edge profile files briefly after the process exits.
      }
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1_500);
    });
    await rm(userDataDir, {
      force: true,
      maxRetries: 20,
      recursive: true,
      retryDelay: 250,
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

function categoryScore(result, category) {
  return result?.lhr.categories[category]?.score ?? null;
}

function resultFailsThreshold(result) {
  return Object.entries(minimumScores).some(([category, minimum]) => {
    const score = categoryScore(result, category);
    return score === null || score < minimum;
  });
}

function medianScore(results, category) {
  const scores = results
    .map((result) => categoryScore(result, category))
    .filter((score) => score !== null)
    .sort((left, right) => left - right);
  return scores[Math.floor(scores.length / 2)] ?? null;
}

try {
  await waitForServer();
  const automaticChromePath = chromium.executablePath();
  const chromePath = process.env.CHROME_PATH ?? automaticChromePath;

  const failures = [];
  for (const profile of profiles) {
    for (const route of routes) {
    const firstResult = await runLighthouseWithTraceRetry(route, chromePath, profile);
    if (!firstResult) {
      failures.push(`${profile} ${route}: Lighthouse returned no result.`);
      continue;
    }

    const results = [firstResult];
    if (resultFailsThreshold(firstResult)) {
      // Lighthouse deliberately adds CPU and network throttling, so runs close
      // to a threshold can vary on shared CI workers. Re-run only a failing
      // route and gate on the median of five measurements. Passing routes
      // still consume one run, while one or two noisy samples cannot fail an
      // otherwise healthy release.
      for (let attempt = 2; attempt <= maximumScoreAttempts; attempt += 1) {
        console.log(
          `${profile} ${route} is below a target; collecting median sample ${String(attempt)}/${String(maximumScoreAttempts)}.`,
        );
        const retry = await runLighthouseWithTraceRetry(route, chromePath, profile);
        if (retry) results.push(retry);
      }
      console.log(
        `${profile} ${route} performance samples: ${results
          .map((result) => {
            const score = categoryScore(result, "performance");
            return score === null ? "null" : String(Math.round(score * 100));
          })
          .join(", ")}.`,
      );
      if (results.length !== maximumScoreAttempts) {
        failures.push(
          `${profile} ${route}: Lighthouse returned only ${String(results.length)} of ${String(maximumScoreAttempts)} score samples.`,
        );
        continue;
      }
    }

    const scores = {};
    for (const [category, minimum] of Object.entries(minimumScores)) {
      const score = medianScore(results, category);
      if (score === null) {
        const runtimeMessage =
          results.at(-1)?.lhr.runtimeError?.message ?? "No runtime error reported.";
        failures.push(`${profile} ${route}: ${category} did not produce a score. ${runtimeMessage}`);
        scores[category] = 0;
        continue;
      }
      scores[category] = Math.round(score * 100);
      if (score < minimum) {
        failures.push(
          `${profile} ${route}: ${category} ${String(Math.round(score * 100))} is below ${String(Math.round(minimum * 100))}.`,
        );
        const diagnosticResult = [...results].sort((left, right) => {
          const leftScore = categoryScore(left, category) ?? 0;
          const rightScore = categoryScore(right, category) ?? 0;
          return leftScore - rightScore;
        })[Math.floor(results.length / 2)] ?? results.at(-1);
        const categoryResult = diagnosticResult?.lhr.categories[category];
        const failedAudits = (categoryResult?.auditRefs ?? [])
          .filter(({ weight }) => weight > 0)
          .map(({ id, weight }) => ({
            audit: diagnosticResult?.lhr.audits[id],
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
            const diagnostic = diagnosticResult?.lhr.audits[id];
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
