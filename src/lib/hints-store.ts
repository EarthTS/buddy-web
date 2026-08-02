import { promises as fs } from "fs";
import path from "path";
import { getHintsCollection, isFirebaseConfigured } from "@/lib/firebase";

export type Hint = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
};

const HINTS_FILE = path.join(process.cwd(), "data", "hints.json");

function useFirebase() {
  return isFirebaseConfigured();
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

function missingStorageError(): never {
  throw new Error(
    "ยังไม่ได้ตั้งค่า Firebase — เพิ่ม FIREBASE_SERVICE_ACCOUNT_KEY ใน Vercel Environment Variables แล้ว Redeploy",
  );
}

function requireBackend() {
  if (useFirebase()) return "firebase" as const;
  if (!process.env.VERCEL) return "file" as const;
  missingStorageError();
}

export async function getHintsForParticipant(
  participantId: string,
): Promise<Hint[]> {
  const backend = requireBackend();

  if (backend === "file") {
    const hints = await loadHintsFromFile();
    return hints
      .filter((hint) => hint.toId === participantId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  const snapshot = await getHintsCollection()
    .where("toId", "==", participantId)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as Hint)
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
  const hint: Hint = {
    id: crypto.randomUUID(),
    fromId,
    toId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const backend = requireBackend();

  if (backend === "file") {
    const hints = await loadHintsFromFile();
    hints.push(hint);
    await saveHintsToFile(hints);
    return hint;
  }

  await getHintsCollection().doc(hint.id).set(hint);
  return hint;
}

export async function resetHints(): Promise<void> {
  const backend = requireBackend();

  if (backend === "file") {
    await saveHintsToFile([]);
    return;
  }

  const snapshot = await getHintsCollection().get();
  const batch = getHintsCollection().firestore.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export function getActiveStorageBackend() {
  if (useFirebase()) return "firebase";
  if (!process.env.VERCEL) return "file";
  return null;
}
