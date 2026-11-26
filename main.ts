// One-Line Office Joke Laugh-Off entry.
// Writes a single original office joke to /output/entry.txt and verifies it.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "The office plant got promoted before I did \u2014 turns out it's the only one here that's actually growing.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // Gate: UTF-8 text, 1-200 characters, not only whitespace, single line.
  const chars = [...ENTRY];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry is ${chars.length} chars, gate is 1-200`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // Fail-fast: reject control characters and a leading BOM, which would
  // silently corrupt the sealed gate check even though the text looks fine.
  for (const ch of ENTRY) {
    const code = ch.codePointAt(0) as number;
    if ((code < 0x20 && ch !== "\t") || code === 0x7f || code === 0xfeff) {
      throw new Error(`entry contains a forbidden character U+${code.toString(16)}`);
    }
  }

  // Empty /output's CONTENTS only; never remove the directory itself.
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  for (const name of readdirSync(OUT_DIR)) {
    rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
  }

  writeFileSync(OUT_FILE, ENTRY, "utf8");

  // Read-back verification: bytes must match exactly.
  const back = readFileSync(OUT_FILE, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: /output/entry.txt differs from the entry");
  }
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${OUT_FILE} (${chars.length} chars, sha256 ${sha})`);
}

main();
