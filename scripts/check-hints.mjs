import { readFileSync } from "fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const env = readFileSync(".env.local", "utf8");
const get = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return undefined;
  let value = match[1].trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  return value;
};

initializeApp({
  credential: cert({
    projectId: get("FIREBASE_PROJECT_ID"),
    clientEmail: get("FIREBASE_CLIENT_EMAIL"),
    privateKey: get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  }),
});

const names = {
  "ga-1": "Shintaro Kimura",
  "ga-2": "Agi Suzuki",
  "ga-3": "Kaori Maekawa",
  "ga-4": "Majima Tomizawa",
  "ga-5": "Gorem Yagami",
  "ga-6": "Nogami Kitagawa",
  "ga-7": "Mrebeast Kitamura",
  "ga-8": "Akari Sato",
  "ga-9": "Kla Çetin",
  "ga-10": "Kiru Kos",
  "ga-11": "Otohiko Okazaki",
  "ga-12": "Miru Oshiro",
  "ga-13": "Mika Okawa",
  "ga-14": "Arika Usami",
  "ga-15": "Owakuri Yamaki",
  "ga-16": "Akira Shirakawa",
  "ga-17": "Bouya Togawa",
  "ga-18": "Seongji Kiptoo",
  "ga-19": "Becky Taoka",
  "ga-20": "Eiko Eto",
  "ga-21": "Nyanta Sunada",
  "ga-22": "Phu Hakyemez",
  "ga-23": "Kamugi Becker",
  "ga-24": "Soru Matsushita",
  "ga-25": "Zenji Marin",
  "ga-26": "Shiro Motegi",
  "gb-1": "Khunphan Ackerman",
  "gb-2": "Kyoga Tanimoto",
  "gb-3": "Yakleehee Hitesh",
  "gb-4": "Doofy Lewis",
  "gb-5": "Pancake Costa",
  "gb-6": "Kuriyama Tsukada",
  "gb-7": "Mailo Takei",
  "gb-8": "Gaku D'Alessandro",
  "gb-9": "Well Yoko-o",
  "gb-10": "Mica Mishra",
  "gb-11": "Lilac Okawa",
  "gb-12": "Lily Verlinden",
  "gb-13": "Shion Akiyama",
  "gb-14": "Cherine Miki",
  "gb-15": "Felix Angelov",
  "gb-16": "Yuto Yashitake",
  "gb-17": "Takashima De Medeiros",
  "gb-18": "CoCo Starrk",
  "gb-19": "Danto Shinohara",
  "gb-20": "Mari Aoki",
  "gb-21": "Som Shiga",
  "gb-22": "Sharin Ichikawa",
  "gb-23": "Nana Tanuma",
  "gb-24": "Reeve Mori",
  "gb-25": "Slifer Mondragon",
  "gb-26": "Miki Ray",
  "gb-27": "Gentlesun Maruyama",
  "gb-28": "Cyn nagase",
};

const snap = await getFirestore().collection("hints").get();
const sentCounts = new Map();

for (const doc of snap.docs) {
  const fromId = doc.data().fromId;
  sentCounts.set(fromId, (sentCounts.get(fromId) ?? 0) + 1);
}

const all = Object.keys(names);
const notSent = all.filter((id) => !sentCounts.has(id));
const sent = all.filter((id) => sentCounts.has(id));

console.log(JSON.stringify({ totalHints: snap.size, sentCount: sent.length, notSentCount: notSent.length, sent: sent.map((id) => names[id]), notSent: notSent.map((id) => names[id]), sentCounts: Object.fromEntries(sent.map((id) => [names[id], sentCounts.get(id)])) }, null, 2));
