import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

interface ExcuseCandidate {
  readonly id: string;
  readonly text: string;
}

interface ValidationResult {
  readonly valid: boolean;
  readonly wordCount: number;
  readonly strictTokenCount: number;
  readonly reasons: readonly string[];
}

interface EvaluatedCandidate {
  readonly candidate: ExcuseCandidate;
  readonly validation: ValidationResult;
  readonly rubricScore: number;
}

interface RankedCandidate extends EvaluatedCandidate {
  readonly pairwiseWins: number;
}

const MAX_WORDS = 20;
const MAX_CHARS = 160;
const OUTPUT_FILENAMES = ["excuse.txt", "output.txt"] as const;

const CANDIDATES: readonly ExcuseCandidate[] = [
  {
    id: "water-heater-window",
    text: "Hey sorry, water heater started leaking, mopping up now and plumber window is 10-2, taking PTO today.",
  },
  {
    id: "breaker-box-window",
    text: "Hey sorry, breaker box tripped and electrician window is 9-2, no power in my place, taking PTO today.",
  },
  {
    id: "upstairs-pipe-leak",
    text: "Hey sorry, upstairs pipe leaked into my hallway, waiting on building maintenance all morning, taking PTO today.",
  },
  {
    id: "basement-drain-backup",
    text: "Sorry for the late notice, basement drain backed up and plumber can't make it till afternoon, taking PTO.",
  },
  {
    id: "dental-crown-slot",
    text: "Sorry for the short notice, cracked a crown at breakfast and dentist squeezed me in at 10, taking PTO.",
  },
  {
    id: "lockout-mail-run",
    text: "Hey sorry, apartment locked me out while grabbing mail and locksmith said 11-2, taking PTO today.",
  },
  {
    id: "car-tow-baseline",
    text: "Hey sorry, my car wouldn't start and tow truck is two hours out, taking PTO today.",
  },
  {
    id: "stomach-bug-baseline",
    text: "Sorry, woke up with a nasty stomach bug, going to take a sick day and rest up.",
  },
];

const CLICHE_PATTERN =
  /\b(sick|stomach|migraine|food poisoning|fever|under the weather|car|flat tire|traffic|gta|vice city|game|controller|download|wifi|internet)\b/i;

const OVER_EXPLAIN_PATTERN =
  /\b(promise|make it up|so so sorry|really really|unfortunately|apologize|sincerely|regret)\b/i;

function compareAscii(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

function countStrictTokens(text: string): number {
  const matches = text.match(/[A-Za-z0-9]+/g);
  return matches ? matches.length : 0;
}

function validateExcuse(text: string): ValidationResult {
  const reasons: string[] = [];
  const trimmed = text.trim();
  const wordCount = countWords(trimmed);
  const strictTokenCount = countStrictTokens(trimmed);

  if (trimmed.length === 0) {
    reasons.push("empty");
  }
  if (trimmed !== text) {
    reasons.push("leading-or-trailing-whitespace");
  }
  if (/[\r\n\t]/.test(text)) {
    reasons.push("not-single-line");
  }
  if (/\s{2,}/.test(trimmed)) {
    reasons.push("consecutive-whitespace");
  }
  if (trimmed.length > 0 && !/^[ -~]+$/.test(text)) {
    reasons.push("non-ascii-plain-text");
  }
  if (/[*_`#"]/.test(text)) {
    reasons.push("formatting-or-quotes");
  }
  if (text.length > MAX_CHARS) {
    reasons.push(`exceeds-max-chars:${text.length}`);
  }
  if (wordCount > MAX_WORDS) {
    reasons.push(`exceeds-max-words:${wordCount}`);
  }
  if (strictTokenCount > MAX_WORDS) {
    reasons.push(`exceeds-strict-tokens:${strictTokenCount}`);
  }

  return {
    valid: reasons.length === 0,
    wordCount,
    strictTokenCount,
    reasons,
  };
}

function scoreForTiredManager(text: string, wordCount: number): number {
  let score = 0;

  if (CLICHE_PATTERN.test(text)) {
    score -= 8;
  }

  if (/^(hey\s+sorry|sorry\b)/i.test(text)) {
    score += 2;
  }

  if (/^hey\s+sorry,/i.test(text)) {
    score += 2;
  }

  const commaCount = (text.match(/,/g) ?? []).length;
  if (commaCount >= 2) {
    score += 1;
  }

  if (/\b(leaking|mopping|bailing|shutting off)\b/i.test(text)) {
    score += 3;
  }

  if (/\bleaking\b/i.test(text) && /\bmopping\b/i.test(text)) {
    score += 2;
  }

  if (/\b\d{1,2}-\d{1,2}\b/.test(text)) {
    score += 3;
  }

  if (/\btaking\s+pto\b/i.test(text)) {
    score += 3;
  }

  if (/\b(water heater|leaking|mopping|breaker|power|pipe|drain)\b/i.test(text)) {
    score += 3;
  }

  if (wordCount >= 14 && wordCount <= 18) {
    score += 2;
  } else if (wordCount >= 10 && wordCount <= MAX_WORDS) {
    score += 1;
  }

  if (!OVER_EXPLAIN_PATTERN.test(text)) {
    score += 2;
  } else {
    score -= 3;
  }

  return score;
}

function comparePairwise(left: EvaluatedCandidate, right: EvaluatedCandidate): number {
  if (left.rubricScore !== right.rubricScore) {
    return left.rubricScore - right.rubricScore;
  }
  if (left.validation.wordCount !== right.validation.wordCount) {
    return right.validation.wordCount - left.validation.wordCount;
  }
  return compareAscii(right.candidate.id, left.candidate.id);
}

function selectWinningExcuse(candidates: readonly ExcuseCandidate[]): RankedCandidate {
  const seenIds = new Set<string>();
  const evaluated: EvaluatedCandidate[] = [];

  for (const candidate of candidates) {
    const id = candidate.id.trim();
    if (id.length === 0) {
      throw new Error("Encountered an excuse candidate with an empty id.");
    }
    if (seenIds.has(id)) {
      throw new Error(`Duplicate excuse candidate id: "${id}".`);
    }
    seenIds.add(id);

    const validation = validateExcuse(candidate.text);
    if (!validation.valid) {
      continue;
    }

    evaluated.push({
      candidate,
      validation,
      rubricScore: scoreForTiredManager(candidate.text, validation.wordCount),
    });
  }

  if (evaluated.length === 0) {
    throw new Error("No valid excuse candidates met the single-line 20-word constraint.");
  }

  const wins = new Map<string, number>();
  for (const entry of evaluated) {
    wins.set(entry.candidate.id, 0);
  }

  for (let i = 0; i < evaluated.length; i += 1) {
    for (let j = i + 1; j < evaluated.length; j += 1) {
      const left = evaluated[i];
      const right = evaluated[j];
      const winnerId =
        comparePairwise(left, right) >= 0 ? left.candidate.id : right.candidate.id;
      wins.set(winnerId, (wins.get(winnerId) ?? 0) + 1);
    }
  }

  const ranked: RankedCandidate[] = evaluated
    .map((entry) => ({
      ...entry,
      pairwiseWins: wins.get(entry.candidate.id) ?? 0,
    }))
    .sort((left, right) => {
      if (right.pairwiseWins !== left.pairwiseWins) {
        return right.pairwiseWins - left.pairwiseWins;
      }
      if (right.rubricScore !== left.rubricScore) {
        return right.rubricScore - left.rubricScore;
      }
      return compareAscii(left.candidate.id, right.candidate.id);
    });

  return ranked[0];
}

function resolveOutputDirectory(): string {
  const rawDir = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  const outputDir = resolve(rawDir && rawDir.length > 0 ? rawDir : "out");

  if (existsSync(outputDir) && !statSync(outputDir).isDirectory()) {
    throw new Error(`Output path exists and is not a directory: ${outputDir}`);
  }

  mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

function main(): void {
  const winner = selectWinningExcuse(CANDIDATES);
  const outputDir = resolveOutputDirectory();
  const payload = `${winner.candidate.text}\n`;

  for (const filename of OUTPUT_FILENAMES) {
    writeFileSync(join(outputDir, filename), payload, "utf8");
  }

  process.stdout.write(payload);
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Fatal error: ${message}\n`);
  process.exitCode = 1;
}