import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const env = readFileSync(path.join(root, ".env.local"), "utf8");
const get = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return undefined;
  let value = match[1].trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  return value;
};

initializeApp({
  credential: cert({
    projectId: get("FIREBASE_PROJECT_ID"),
    clientEmail: get("FIREBASE_CLIENT_EMAIL"),
    privateKey: get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  }),
});

const OLD_PAIRINGS = {
  "ga-1": "gb-20", "gb-20": "ga-1",
  "ga-2": "gb-9", "gb-9": "ga-2",
  "ga-3": "gb-8", "gb-8": "ga-3",
  "ga-4": "ga-8", "ga-8": "ga-4",
  "ga-5": "ga-21", "ga-21": "ga-5",
  "ga-6": "gb-23", "gb-23": "ga-6",
  "ga-7": "gb-7", "gb-7": "ga-7",
  "ga-9": "ga-15", "ga-15": "ga-9",
  "ga-10": "gb-12", "gb-12": "ga-10",
  "ga-11": "ga-17", "ga-17": "ga-11",
  "ga-12": "gb-25", "gb-25": "ga-12",
  "ga-13": "ga-23", "ga-23": "ga-13",
  "ga-14": "gb-21", "gb-21": "ga-14",
  "ga-16": "gb-24", "gb-24": "ga-16",
  "ga-18": "gb-4", "gb-4": "ga-18",
  "ga-19": "gb-1", "gb-1": "ga-19",
  "ga-20": "gb-17", "gb-17": "ga-20",
  "ga-22": "gb-13", "gb-13": "ga-22",
  "ga-24": "gb-10", "gb-10": "ga-24",
  "ga-25": "gb-5", "gb-5": "ga-25",
  "ga-26": "gb-19", "gb-19": "ga-26",
  "gb-2": "gb-3", "gb-3": "gb-2",
  "gb-6": "gb-11", "gb-11": "gb-6",
  "gb-14": "gb-28", "gb-28": "gb-14",
  "gb-15": "gb-26", "gb-26": "gb-15",
  "gb-16": "gb-18", "gb-18": "gb-16",
  "gb-22": "gb-27", "gb-27": "gb-22",
};

const PARTICIPANTS = {
  "ga-1": { name: "Shintaro Kimura", group: "A" },
  "ga-2": { name: "Agi Suzuki", group: "A" },
  "ga-3": { name: "Kaori Maekawa", group: "A" },
  "ga-4": { name: "Majima Tomizawa", group: "A" },
  "ga-5": { name: "Gorem Yagami", group: "A" },
  "ga-6": { name: "Nogami Kitagawa", group: "A" },
  "ga-7": { name: "Mrebeast Kitamura", group: "A" },
  "ga-8": { name: "Akari Sato", group: "A" },
  "ga-9": { name: "Kla Çetin", group: "A" },
  "ga-10": { name: "Kiru Kos", group: "A" },
  "ga-11": { name: "Otohiko Okazaki", group: "A" },
  "ga-12": { name: "Miru Oshiro", group: "A" },
  "ga-13": { name: "Mika Okawa", group: "A" },
  "ga-14": { name: "Arika Usami", group: "A" },
  "ga-15": { name: "Owakuri Yamaki", group: "A" },
  "ga-16": { name: "Akira Shirakawa", group: "A" },
  "ga-17": { name: "Bouya Togawa", group: "A" },
  "ga-18": { name: "Seongji Kiptoo", group: "A" },
  "ga-19": { name: "Becky Taoka", group: "A" },
  "ga-20": { name: "Eiko Eto", group: "A" },
  "ga-21": { name: "Nyanta Sunada", group: "A" },
  "ga-22": { name: "Phu Hakyemez", group: "A" },
  "ga-23": { name: "Kamugi Becker", group: "A" },
  "ga-24": { name: "Soru Matsushita", group: "A" },
  "ga-25": { name: "Zenji Marin", group: "A" },
  "ga-26": { name: "Shiro Motegi", group: "A" },
  "gb-1": { name: "Khunphan Ackerman", group: "B" },
  "gb-2": { name: "Kyoga Tanimoto", group: "B" },
  "gb-3": { name: "Yakleehee Hitesh", group: "B" },
  "gb-4": { name: "Doofy Lewis", group: "B" },
  "gb-5": { name: "Pancake Costa", group: "B" },
  "gb-6": { name: "Kuriyama Tsukada", group: "B" },
  "gb-7": { name: "Mailo Takei", group: "B" },
  "gb-8": { name: "Gaku D'Alessandro", group: "B" },
  "gb-9": { name: "Well Yoko-o", group: "B" },
  "gb-10": { name: "Mica Mishra", group: "B" },
  "gb-11": { name: "Lilac Okawa", group: "B" },
  "gb-12": { name: "Lily Verlinden", group: "B" },
  "gb-13": { name: "Shion Akiyama", group: "B" },
  "gb-14": { name: "Cherine Miki", group: "B" },
  "gb-15": { name: "Felix Angelov", group: "B" },
  "gb-16": { name: "Yuto Yashitake", group: "B" },
  "gb-17": { name: "Takashima De Medeiros", group: "B" },
  "gb-18": { name: "CoCo Starrk", group: "B" },
  "gb-19": { name: "Danto Shinohara", group: "B" },
  "gb-20": { name: "Mari Aoki", group: "B" },
  "gb-21": { name: "Som Shiga", group: "B" },
  "gb-22": { name: "Sharin Ichikawa", group: "B" },
  "gb-23": { name: "Nana Tanuma", group: "B" },
  "gb-24": { name: "Reeve Mori", group: "B" },
  "gb-25": { name: "Slifer Mondragon", group: "B" },
  "gb-26": { name: "Miki Ray", group: "B" },
  "gb-27": { name: "Gentlesun Maruyama", group: "B" },
  "gb-28": { name: "Cyn nagase", group: "B" },
};

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const db = getFirestore();
const snap = await db.collection("hints").get();
const sentIds = new Set();
for (const doc of snap.docs) sentIds.add(doc.data().fromId);

const allIds = Object.keys(PARTICIPANTS);
const removedIds = new Set(allIds.filter((id) => !sentIds.has(id)));
const activeIds = allIds.filter((id) => sentIds.has(id));

const newPairings = {};
const orphans = [];

for (const id of activeIds) {
  const oldBuddy = OLD_PAIRINGS[id];
  if (removedIds.has(oldBuddy)) {
    orphans.push(id);
  } else if (activeIds.includes(oldBuddy)) {
    newPairings[id] = oldBuddy;
  }
}

const shuffledOrphans = shuffle(orphans);
for (let i = 0; i < shuffledOrphans.length; i += 2) {
  const a = shuffledOrphans[i];
  const b = shuffledOrphans[i + 1];
  newPairings[a] = b;
  newPairings[b] = a;
}

const newBuddyFor = (fromId) => newPairings[fromId];

let deleted = 0;
let migrated = 0;
let batch = db.batch();
let ops = 0;

async function flushBatch() {
  if (ops === 0) return;
  await batch.commit();
  batch = db.batch();
  ops = 0;
}

for (const doc of snap.docs) {
  const hint = doc.data();
  const { fromId, toId } = hint;

  if (removedIds.has(fromId)) {
    batch.delete(doc.ref);
    deleted++;
    ops++;
    if (ops >= 400) await flushBatch();
    continue;
  }

  if (removedIds.has(toId)) {
    const target = newBuddyFor(fromId);
    if (!target) {
      batch.delete(doc.ref);
      deleted++;
    } else {
      batch.update(doc.ref, { toId: target });
      migrated++;
    }
    ops++;
    if (ops >= 400) await flushBatch();
  }
}

await flushBatch();

const groupA = activeIds.filter((id) => PARTICIPANTS[id].group === "A");
const groupB = activeIds.filter((id) => PARTICIPANTS[id].group === "B");

function sortIds(ids) {
  return [...ids].sort((a, b) => {
    const [pa, na] = a.split("-");
    const [pb, nb] = b.split("-");
    if (pa !== pb) return pa.localeCompare(pb);
    return Number(na) - Number(nb);
  });
}

const pairingLines = sortIds(activeIds)
  .filter((id) => id < newPairings[id])
  .flatMap((a) => {
    const b = newPairings[a];
    return [`  "${a}": "${b}",`, `  "${b}": "${a}",`];
  })
  .join("\n");

const groupALines = sortIds(groupA)
  .map((id) => `  { id: "${id}", name: "${PARTICIPANTS[id].name}", group: "A" },`)
  .join("\n");

const groupBLines = sortIds(groupB)
  .map((id) => `  { id: "${id}", name: "${PARTICIPANTS[id].name}", group: "B" },`)
  .join("\n");

const participantsTs = `export type Participant = {
  id: string;
  name: string;
  group: "A" | "B";
};

export const GROUP_A: Participant[] = [
${groupALines}
];

export const GROUP_B: Participant[] = [
${groupBLines}
];

/** Locked buddy pairings */
export const BUDDY_PAIRINGS: Record<string, string> = {
${pairingLines}
};

export const ALL_PARTICIPANTS: Participant[] = [...GROUP_A, ...GROUP_B];

const participantMap = new Map(ALL_PARTICIPANTS.map((p) => [p.id, p]));

export function getParticipant(id: string): Participant | undefined {
  return participantMap.get(id);
}

export function getBuddyId(participantId: string): string | null {
  return BUDDY_PAIRINGS[participantId] ?? null;
}

export function getBuddy(participantId: string): Participant | undefined {
  const buddyId = getBuddyId(participantId);
  return buddyId ? getParticipant(buddyId) : undefined;
}
`;

writeFileSync(path.join(root, "src", "lib", "participants.ts"), participantsTs, "utf-8");

const name = (id) => PARTICIPANTS[id].name;
const newPairs = sortIds(activeIds)
  .filter((id) => id < newPairings[id])
  .map((a) => `${name(a)} × ${name(newPairings[a])}`);

const reshuffledPairs = shuffledOrphans
  .reduce((acc, _, i, arr) => {
    if (i % 2 === 0) acc.push(`${name(arr[i])} × ${name(arr[i + 1])}`);
    return acc;
  }, []);

console.log(JSON.stringify({
  removed: [...removedIds].map(name),
  activeCount: activeIds.length,
  pairCount: activeIds.length / 2,
  hintsDeleted: deleted,
  hintsMigrated: migrated,
  intactPairs: sortIds(activeIds)
    .filter((id) => id < newPairings[id] && !orphans.includes(id))
    .map((a) => `${name(a)} × ${name(newPairings[a])}`),
  newRandomPairs: reshuffledPairs,
  allPairs: newPairs,
}, null, 2));
