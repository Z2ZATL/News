import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

type ContentDocument = Record<string, unknown> & {
  _createdAt?: string;
  _id: string;
  _rev?: string;
  _type: string;
  _updatedAt?: string;
};

const CONTENT_TYPES = ["article", "author", "category", "project"] as const;
const apply = process.argv.includes("--apply");
const deleteLegacy = process.argv.includes("--delete-legacy");
const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({
  perspective: "raw",
  useCdn: false,
});

function publicId(id: string): string {
  const source = id.startsWith("drafts.") ? id.slice("drafts.".length) : id;
  return source.replaceAll(".", "-");
}

function migratedId(id: string): string {
  const target = publicId(id);
  return id.startsWith("drafts.") ? `drafts.${target}` : target;
}

function rewriteReferences(value: unknown, idMap: ReadonlyMap<string, string>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteReferences(item, idMap));
  }
  if (!value || typeof value !== "object") return value;

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source)) {
    if (key === "_ref" && typeof item === "string") {
      result[key] = idMap.get(item) ?? item;
    } else {
      result[key] = rewriteReferences(item, idMap);
    }
  }
  return result;
}

function cloneForMigration(
  document: ContentDocument,
  idMap: ReadonlyMap<string, string>,
): ContentDocument {
  const { _createdAt: _created, _rev: _revision, _updatedAt: _updated, ...content } = document;
  void _created;
  void _revision;
  void _updated;
  return {
    ...(rewriteReferences(content, idMap) as ContentDocument),
    _id: idMap.get(document._id) ?? document._id,
  };
}

async function main(): Promise<void> {
  const documents = await client.fetch<ContentDocument[]>(
    `*[_type in $types]`,
    { types: [...CONTENT_TYPES] },
  );
  const candidates = documents.filter((document) => {
    const source = document._id.startsWith("drafts.")
      ? document._id.slice("drafts.".length)
      : document._id;
    return source.includes(".");
  });
  const idMap = new Map<string, string>();
  for (const document of candidates) {
    idMap.set(document._id, migratedId(document._id));
    if (!document._id.startsWith("drafts.")) {
      idMap.set(document._id, publicId(document._id));
    }
  }

  const targets = [...idMap.values()];
  if (new Set(targets).size !== targets.length) {
    throw new Error("Public ID migration produced a collision.");
  }

  const summary = candidates.map((document) => ({
    from: document._id,
    to: idMap.get(document._id),
    type: document._type,
  }));
  const backupDirectory = join(process.cwd(), "..", ".migration-backups");
  // The path is derived only from the fixed repository-relative directory above.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await mkdir(backupDirectory, { recursive: true });
  const dryRunPath = join(backupDirectory, "public-id-dry-run.json");
  // This fixed report path is repository-relative and contains no user input.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(
    dryRunPath,
    `${JSON.stringify({ apply, deleteLegacy, documents: summary }, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify({ apply, deleteLegacy, documents: summary }, null, 2));
  if (!apply) {
    console.log(`Dry run complete. Review ${dryRunPath}, then re-run with --apply.`);
    return;
  }
  if (candidates.length === 0) {
    console.log("No dot-based content IDs require migration.");
    return;
  }

  const backupPath = join(
    backupDirectory,
    `public-id-migration-${new Date().toISOString().replaceAll(":", "-")}.json`,
  );
  // The filename is generated locally from an ISO timestamp, never from user input.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(backupPath, `${JSON.stringify(candidates, null, 2)}\n`, "utf8");

  let transaction = client.transaction();
  for (const document of candidates) {
    transaction = transaction.createOrReplace(cloneForMigration(document, idMap));
  }
  if (deleteLegacy) {
    for (const document of candidates) {
      transaction = transaction.delete(document._id);
    }
  }
  await transaction.commit({ visibility: "sync" });

  const migrated = await client.fetch<Array<{ _id: string; _type: string }>>(
    `*[_id in $ids]{_id, _type}`,
    { ids: targets },
  );
  if (migrated.length !== targets.length) {
    throw new Error(
      `Migration verification failed: expected ${String(targets.length)} documents, got ${String(migrated.length)}.`,
    );
  }
  const remainingIds = await client.fetch<string[]>(
    `*[_type in $types]._id`,
    { types: [...CONTENT_TYPES] },
  );
  const legacyCount = remainingIds.filter(
    (id) => !id.startsWith("drafts.") && id.includes("."),
  ).length;
  if (deleteLegacy && legacyCount !== 0) {
    throw new Error(`Migration left ${String(legacyCount)} non-public document IDs behind.`);
  }
  console.log(
    deleteLegacy
      ? `Public ID migration and legacy cleanup complete. Local backup: ${backupPath}`
      : `Public ID copies created; legacy documents were preserved. Local backup: ${backupPath}`,
  );
}

await main();
