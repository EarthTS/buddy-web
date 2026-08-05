import { readFileSync } from "fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const env = readFileSync(".env.local", "utf8");
const get = (key) => {
  const m = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!m) return undefined;
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  return v;
};

initializeApp({
  credential: cert({
    projectId: get("FIREBASE_PROJECT_ID"),
    clientEmail: get("FIREBASE_CLIENT_EMAIL"),
    privateKey: get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  }),
});

const PAIRINGS = {
  "ga-1": "gb-22", "gb-22": "ga-1",
  "ga-3": "gb-4", "gb-4": "ga-3",
  "ga-4": "ga-8", "ga-8": "ga-4",
  "ga-6": "ga-7", "ga-7": "ga-6",
  "ga-10": "gb-12", "gb-12": "ga-10",
  "ga-12": "gb-25", "gb-25": "ga-12",
  "ga-14": "gb-21", "gb-21": "ga-14",
  "ga-15": "ga-9", "ga-9": "ga-15",
  "ga-16": "gb-13", "gb-13": "ga-16",
  "ga-17": "ga-2", "ga-2": "ga-17",
  "ga-19": "gb-1", "gb-1": "ga-19",
  "ga-20": "gb-17", "gb-17": "ga-20",
  "ga-21": "ga-5", "ga-5": "ga-21",
  "ga-23": "gb-10", "gb-10": "ga-23",
  "ga-25": "gb-5", "gb-5": "ga-25",
  "gb-2": "gb-3", "gb-3": "gb-2",
  "gb-11": "gb-6", "gb-6": "gb-11",
  "gb-14": "gb-28", "gb-28": "gb-14",
  "gb-15": "gb-26", "gb-26": "gb-15",
  "gb-16": "gb-18", "gb-18": "gb-16",
};

const active = new Set(Object.keys(PAIRINGS));
const snap = await getFirestore().collection("hints").get();
const bad = [];

for (const doc of snap.docs) {
  const { fromId, toId } = doc.data();
  if (!active.has(fromId)) bad.push({ id: doc.id, issue: "from removed", fromId, toId });
  else if (!active.has(toId)) bad.push({ id: doc.id, issue: "to removed", fromId, toId });
  else if (PAIRINGS[fromId] !== toId) bad.push({ id: doc.id, issue: "wrong buddy", fromId, toId, expected: PAIRINGS[fromId] });
}

console.log(JSON.stringify({ totalHints: snap.size, badCount: bad.length, bad: bad.slice(0, 10) }, null, 2));
