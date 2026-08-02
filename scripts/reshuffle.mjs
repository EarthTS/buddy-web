import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const GROUP_A = Array.from({ length: 26 }, (_, i) => `ga-${i + 1}`);
const GROUP_B = Array.from({ length: 28 }, (_, i) => `gb-${i + 1}`);
const all = [...GROUP_A, ...GROUP_B];

for (let i = all.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [all[i], all[j]] = [all[j], all[i]];
}

const pairings = {};
for (let i = 0; i < all.length; i += 2) {
  pairings[all[i]] = all[i + 1];
  pairings[all[i + 1]] = all[i];
}

const participantsPath = path.join(root, "src", "lib", "participants.ts");
let content = readFileSync(participantsPath, "utf-8");

const pairingLines = Object.entries(pairings)
  .filter(([a]) => a < pairings[a])
  .sort(([a], [b]) => a.localeCompare(b))
  .flatMap(([a, b]) => [`  "${a}": "${b}",`, `  "${b}": "${a}",`])
  .join("\n");

content = content.replace(
  /\/\*\* Hardcoded random buddy pairings: Group A ↔ Group B \*\/\r?\nexport const BUDDY_PAIRINGS: Record<string, string> = \{[\s\S]*?\};/,
  `/** Hardcoded random buddy pairings (all participants paired) */\nexport const BUDDY_PAIRINGS: Record<string, string> = {\n${pairingLines}\n};`,
);

writeFileSync(participantsPath, content, "utf-8");
writeFileSync(path.join(root, "data", "hints.json"), "[]\n", "utf-8");

if (process.env.BLOB_READ_WRITE_TOKEN) {
  const { put } = await import("@vercel/blob");
  await put("buddy/hints.json", "[]", {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
  console.log("Blob hints reset.");
}

console.log(`Reshuffled ${Object.keys(pairings).length / 2} pairs. Hints reset.`);
