import { head, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export type Hint = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
};

const BLOB_PATHNAME = "buddy/hints.json";
const HINTS_FILE = path.join(process.cwd(), "data", "hints.json");

function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureDataFile() {
  const dir = path.dirname(HINTS_FILE);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(HINTS_FILE);
  } catch {
    await fs.writeFile(HINTS_FILE, "[]", "utf-8");
  }
}

async function loadHintsFromFile(): Promise<Hint[]> {
  await ensureDataFile();
  const raw = await fs.readFile(HINTS_FILE, "utf-8");
  return JSON.parse(raw) as Hint[];
}

async function saveHintsToFile(hints: Hint[]) {
  await ensureDataFile();
  await fs.writeFile(HINTS_FILE, JSON.stringify(hints, null, 2), "utf-8");
}

async function loadHintsFromBlob(): Promise<Hint[]> {
  try {
    const blob = await head(BLOB_PATHNAME);
    const res = await fetch(blob.url);

    if (!res.ok) {
      throw new Error("Failed to read hints blob");
    }

    return (await res.json()) as Hint[];
  } catch {
    return [];
  }
}

async function saveHintsToBlob(hints: Hint[]) {
  await put(BLOB_PATHNAME, JSON.stringify(hints), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function missingStorageError() {
  throw new Error(
    "Missing BLOB_READ_WRITE_TOKEN. Add Vercel Blob storage to the project.",
  );
}

async function loadHints(): Promise<Hint[]> {
  if (useBlobStorage()) {
    return loadHintsFromBlob();
  }

  if (process.env.VERCEL) {
    missingStorageError();
  }

  return loadHintsFromFile();
}

async function saveHints(hints: Hint[]) {
  if (useBlobStorage()) {
    await saveHintsToBlob(hints);
    return;
  }

  if (process.env.VERCEL) {
    missingStorageError();
  }

  await saveHintsToFile(hints);
}

export async function getHintsForParticipant(
  participantId: string,
): Promise<Hint[]> {
  const hints = await loadHints();
  return hints
    .filter((hint) => hint.toId === participantId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function addHint(
  fromId: string,
  toId: string,
  text: string,
): Promise<Hint> {
  const hints = await loadHints();
  const hint: Hint = {
    id: crypto.randomUUID(),
    fromId,
    toId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  hints.push(hint);
  await saveHints(hints);
  return hint;
}

export async function resetHints(): Promise<void> {
  await saveHints([]);
}

export function isUsingBlobStorage() {
  return useBlobStorage();
}
