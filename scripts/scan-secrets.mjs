import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const root = process.cwd();
const binaryExtensions = new Set([
  ".avif", ".gif", ".ico", ".jpeg", ".jpg", ".mp4", ".png", ".ttf", ".webp", ".woff", ".woff2", ".zip",
]);
const patterns = [
  ["public secret-like environment variable", /NEXT_PUBLIC_[A-Z0-9_]*(?:KEY|SECRET|TOKEN)[A-Z0-9_]*/g],
  ["OpenAI or compatible secret key", /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g],
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/g],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["Stripe live secret", /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/g],
  ["JWT-like credential", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g],
];

async function recursiveFiles(directory) {
  const output = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return output;
    throw error;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await recursiveFiles(path)));
    else output.push(path);
  }
  return output;
}

const { stdout } = await execute("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: root });
const tracked = stdout.split("\0").filter(Boolean).map((path) => join(root, path));
const generated = [
  ...(await recursiveFiles(join(root, ".next", "static"))),
  ...(await recursiveFiles(join(root, ".next", "server"))),
];
const candidates = [...new Set([...tracked, ...generated])];
const findings = [];

for (const path of candidates) {
  if (binaryExtensions.has(extname(path).toLowerCase())) continue;
  let fileStats;
  try {
    fileStats = await stat(path);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") continue;
    throw error;
  }
  if (fileStats.size > 10_000_000) continue;
  let content;
  try {
    content = await readFile(path, "utf8");
  } catch {
    continue;
  }
  for (const [label, regex] of patterns) {
    for (const match of content.matchAll(regex)) {
      const line = content.slice(0, match.index).split("\n").length;
      findings.push(`${relative(root, path)}:${String(line)} ${label}`);
    }
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed across ${String(candidates.length)} source and build files.`);
}
