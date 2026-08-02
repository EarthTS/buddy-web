export type Participant = {
  id: string;
  name: string;
  group: "A" | "B";
};

export const GROUP_A: Participant[] = [
  { id: "ga-1", name: "Shintaro Kimura", group: "A" },
  { id: "ga-2", name: "Agi Suzuki", group: "A" },
  { id: "ga-3", name: "Kaori Maekawa", group: "A" },
  { id: "ga-4", name: "Majima Tomizawa", group: "A" },
  { id: "ga-5", name: "Gorem Yagami", group: "A" },
  { id: "ga-6", name: "Nogami Kitagawa", group: "A" },
  { id: "ga-7", name: "Mrebeast Kitamura", group: "A" },
  { id: "ga-8", name: "Akari Sato", group: "A" },
  { id: "ga-9", name: "Kla Çetin", group: "A" },
  { id: "ga-10", name: "Kiru Kos", group: "A" },
  { id: "ga-11", name: "Otohiko Okazaki", group: "A" },
  { id: "ga-12", name: "Miru Oshiro", group: "A" },
  { id: "ga-13", name: "Mika Okawa", group: "A" },
  { id: "ga-14", name: "Arika Usami", group: "A" },
  { id: "ga-15", name: "Owakuri Yamaki", group: "A" },
  { id: "ga-16", name: "Akira Shirakawa", group: "A" },
  { id: "ga-17", name: "Bouya Togawa", group: "A" },
  { id: "ga-18", name: "Seongji Kiptoo", group: "A" },
  { id: "ga-19", name: "Becky Taoka", group: "A" },
  { id: "ga-20", name: "Eiko Eto", group: "A" },
  { id: "ga-21", name: "Nyanta Sunada", group: "A" },
  { id: "ga-22", name: "Phu Hakyemez", group: "A" },
  { id: "ga-23", name: "Kamugi Becker", group: "A" },
  { id: "ga-24", name: "Soru Matsushita", group: "A" },
  { id: "ga-25", name: "Zenji Marin", group: "A" },
  { id: "ga-26", name: "Shiro Motegi", group: "A" },
];

export const GROUP_B: Participant[] = [
  { id: "gb-1", name: "Khunphan Ackerman", group: "B" },
  { id: "gb-2", name: "Kyoga Tanimoto", group: "B" },
  { id: "gb-3", name: "Yakleehee Hitesh", group: "B" },
  { id: "gb-4", name: "Doofy Lewis", group: "B" },
  { id: "gb-5", name: "Pancake Costa", group: "B" },
  { id: "gb-6", name: "Kuriyama Tsukada", group: "B" },
  { id: "gb-7", name: "Mailo Takei", group: "B" },
  { id: "gb-8", name: "Gaku D'Alessandro", group: "B" },
  { id: "gb-9", name: "Well Yoko-o", group: "B" },
  { id: "gb-10", name: "Mica Mishra", group: "B" },
  { id: "gb-11", name: "Lilac Okawa", group: "B" },
  { id: "gb-12", name: "Lily Verlinden", group: "B" },
  { id: "gb-13", name: "Shion Akiyama", group: "B" },
  { id: "gb-14", name: "Cherine Miki", group: "B" },
  { id: "gb-15", name: "Felix Angelov", group: "B" },
  { id: "gb-16", name: "Yuto Yashitake", group: "B" },
  { id: "gb-17", name: "Takashima De Medeiros", group: "B" },
  { id: "gb-18", name: "CoCo Starrk", group: "B" },
  { id: "gb-19", name: "Danto Shinohara", group: "B" },
  { id: "gb-20", name: "Mari Aoki", group: "B" },
  { id: "gb-21", name: "Som Shiga", group: "B" },
  { id: "gb-22", name: "Sharin Ichikawa", group: "B" },
  { id: "gb-23", name: "Nana Tanuma", group: "B" },
  { id: "gb-24", name: "Reeve Mori", group: "B" },
  { id: "gb-25", name: "Slifer Mondragon", group: "B" },
  { id: "gb-26", name: "Miki Ray", group: "B" },
  { id: "gb-27", name: "Gentlesun Maruyama", group: "B" },
  { id: "gb-28", name: "Cyn nagase", group: "B" },
];

/** Locked buddy pairings */
export const BUDDY_PAIRINGS: Record<string, string> = {
  "ga-1": "gb-20",
  "gb-20": "ga-1",
  "ga-2": "gb-9",
  "gb-9": "ga-2",
  "ga-3": "gb-8",
  "gb-8": "ga-3",
  "ga-4": "ga-8",
  "ga-8": "ga-4",
  "ga-5": "ga-21",
  "ga-21": "ga-5",
  "ga-6": "gb-23",
  "gb-23": "ga-6",
  "ga-7": "gb-7",
  "gb-7": "ga-7",
  "ga-9": "ga-15",
  "ga-15": "ga-9",
  "ga-10": "gb-12",
  "gb-12": "ga-10",
  "ga-11": "ga-17",
  "ga-17": "ga-11",
  "ga-12": "gb-25",
  "gb-25": "ga-12",
  "ga-13": "ga-23",
  "ga-23": "ga-13",
  "ga-14": "gb-21",
  "gb-21": "ga-14",
  "ga-16": "gb-24",
  "gb-24": "ga-16",
  "ga-18": "gb-4",
  "gb-4": "ga-18",
  "ga-19": "gb-1",
  "gb-1": "ga-19",
  "ga-20": "gb-17",
  "gb-17": "ga-20",
  "ga-22": "gb-13",
  "gb-13": "ga-22",
  "ga-24": "gb-10",
  "gb-10": "ga-24",
  "ga-25": "gb-5",
  "gb-5": "ga-25",
  "ga-26": "gb-19",
  "gb-19": "ga-26",
  "gb-2": "gb-3",
  "gb-3": "gb-2",
  "gb-6": "gb-11",
  "gb-11": "gb-6",
  "gb-14": "gb-28",
  "gb-28": "gb-14",
  "gb-15": "gb-26",
  "gb-26": "gb-15",
  "gb-16": "gb-18",
  "gb-18": "gb-16",
  "gb-22": "gb-27",
  "gb-27": "gb-22",
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
