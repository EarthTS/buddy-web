import { Redis } from "@upstash/redis";
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
const REDIS_KEY = "buddy:hints";
const HINTS_FILE = path.join(process.cwd(), "data", "hints.json");

type StorageBackend = "blob" | "redis" | "file";

function getStorageBackend(): StorageBackend | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";

  const redisUrl =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const redisToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (redisUrl && redisToken) return "redis";

  if (!process.env.VERCEL) return "file";

  return null;
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
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

async function loadHintsFromRedis(): Promise<Hint[]> {
  const redis = getRedis();
  if (!redis) return [];
  const hints = await redis.get<Hint[]>(REDIS_KEY);
  return hints ?? [];
}

async function saveHintsToRedis(hints: Hint[]) {
  const redis = getRedis();
  if (!redis) throw new Error("Redis not configured");
  await redis.set(REDIS_KEY, hints);
}

function missingStorageError(): never {
  throw new Error(
    "ยังไม่ได้ตั้งค่า Storage บน Vercel — ไปที่ Storage → Create → Blob หรือ Upstash Redis → Connect to Project → Redeploy",
  );
}

async function loadHints(): Promise<Hint[]> {
  const backend = getStorageBackend();
  if (!backend) missingStorageError();

  switch (backend) {
    case "blob":
      return loadHintsFromBlob();
    case "redis":
      return loadHintsFromRedis();
    case "file":
      return loadHintsFromFile();
    default:
      missingStorageError();
  }
}

async function saveHints(hints: Hint[]) {
  const backend = getStorageBackend();
  if (!backend) missingStorageError();

  switch (backend) {
    case "blob":
      await saveHintsToBlob(hints);
      return;
    case "redis":
      await saveHintsToRedis(hints);
      return;
    case "file":
      await saveHintsToFile(hints);
      return;
    default:
      missingStorageError();
  }
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

export function getActiveStorageBackend() {
  return getStorageBackend();
}
