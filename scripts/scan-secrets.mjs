import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const roots = ["src", "studio", ".next/static"];
const extensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".map",
  ".mjs",
  ".ts",
  ".tsx",
]);
const patterns = [
  {
    label: "public secret-like environment variable",
    regex: /NEXT_PUBLIC_[A-Z0-9_]*(?:KEY|SECRET|TOKEN)[A-Z0-9_]*/g,
  },
  {
    label: "OpenAI secret key",
    regex: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    label: "GitHub token",
    regex: /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    label: "private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
];

async function files(directory) {
  const output = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return output;
    }
    throw error;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(path)));
    else if (extensions.has(extname(entry.name))) output.push(path);
  }
  return output;
}

const findings = [];
for (const directory of roots) {
  for (const path of await files(join(root, directory))) {
    const content = await readFile(path, "utf8");
    for (const pattern of patterns) {
      for (const match of content.matchAll(pattern.regex)) {
        const line = content.slice(0, match.index).split("\n").length;
        findings.push(`${relative(root, path)}:${line} ${pattern.label}`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Secret scan passed.");
}
