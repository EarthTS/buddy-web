import { promises as fs } from "fs";
import path from "path";

export type Hint = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
};

const HINTS_FILE = path.join(process.cwd(), "data", "hints.json");

async function ensureDataFile() {
  const dir = path.dirname(HINTS_FILE);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(HINTS_FILE);
  } catch {
    await fs.writeFile(HINTS_FILE, "[]", "utf-8");
  }
}

async function loadHints(): Promise<Hint[]> {
  await ensureDataFile();
  const raw = await fs.readFile(HINTS_FILE, "utf-8");
  return JSON.parse(raw) as Hint[];
}

async function saveHints(hints: Hint[]) {
  await ensureDataFile();
  await fs.writeFile(HINTS_FILE, JSON.stringify(hints, null, 2), "utf-8");
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
