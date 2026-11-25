export type ExcuseCategory =
  | "dental"
  | "domestic"
  | "medical"
  | "lockout"
  | "caregiving"
  | "transit";

export interface ExcuseCandidate {
  readonly id: string;
  readonly text: string;
  readonly category: ExcuseCategory;
  readonly anchor: string;
  readonly concession: boolean;
  readonly mundaneDetail: number;
}

export interface ExcuseSignals {
  readonly wordCount: number;
  readonly charCount: number;
  readonly isSingleLine: boolean;
  readonly withinWordLimit: boolean;
  readonly hasHastyOpening: boolean;
  readonly contractionCount: number;
  readonly corporateJargonHits: number;
  readonly clicheHits: number;
  readonly gamingLeakHits: number;
  readonly concreteAnchorHits: number;
  readonly mundaneFrictionHits: number;
  readonly concessionHits: number;
  readonly exclamationCount: number;
  readonly avgWordLength: number;
  readonly sentenceCount: number;
  readonly hasteScore: number;
  readonly credibilityScore: number;
  readonly managerSkepticismRisk: number;
  readonly compositeScore: number;
}

export interface RankedExcuse {
  readonly candidate: ExcuseCandidate;
  readonly signals: ExcuseSignals;
}

export const MAX_EXCUSE_WORDS = 20;

export const EXCUSE_CANDIDATES: readonly ExcuseCandidate[] = [
  {
    id: "dental-temp-crown",
    text: "Morning, temp crown popped off eating toast and my dentist can squeeze me in at 10:30, taking today off.",
    category: "dental",
    anchor: "temp crown",
    concession: true,
    mundaneDetail: 0.96,
  },
  {
    id: "domestic-downstairs-leak",
    text: "Hey sorry, downstairs neighbor has a leak from my bathroom and the super needs me here for the plumber.",
    category: "domestic",
    anchor: "downstairs leak",
    concession: false,
    mundaneDetail: 0.95,
  },
  {
    id: "medical-swollen-eye",
    text: "Hey sorry, woke up with one eye swollen half shut so heading to urgent care, taking a sick day.",
    category: "medical",
    anchor: "swollen eye",
    concession: true,
    mundaneDetail: 0.93,
  },
  {
    id: "lockout-deadbolt-key",
    text: "Sorry, my key snapped in the deadbolt and maintenance can't get here till afternoon, taking PTO today.",
    category: "lockout",
    anchor: "snapped deadbolt key",
    concession: true,
    mundaneDetail: 0.94,
  },
  {
    id: "lockout-trash-socks",
    text: "Hey sorry, locked myself out taking trash down and the locksmith quoted noon, taking PTO today, back tomorrow.",
    category: "lockout",
    anchor: "locksmith wait",
    concession: true,
    mundaneDetail: 0.91,
  },
  {
    id: "dental-filling-breakfast",
    text: "Morning, my filling fell out at breakfast and the dentist has an 11am opening, gonna take today off.",
    category: "dental",
    anchor: "lost filling",
    concession: true,
    mundaneDetail: 0.94,
  },
  {
    id: "caregiving-vet-morning",
    text: "Hey sorry, dog threw up twice this morning and the vet wants him in at 11, taking PTO today.",
    category: "caregiving",
    anchor: "morning vet visit",
    concession: true,
    mundaneDetail: 0.88,
  },
  {
    id: "domestic-water-heater",
    text: "Hey sorry, water heater is leaking into the hall and landlord's plumber comes at noon, taking today off.",
    category: "domestic",
    anchor: "water heater leak",
    concession: true,
    mundaneDetail: 0.92,
  },
  {
    id: "medical-lower-back",
    text: "Morning, pulled my lower back getting dressed and can barely sit up, gonna take a sick day.",
    category: "medical",
    anchor: "pulled lower back",
    concession: true,
    mundaneDetail: 0.85,
  },
  {
    id: "domestic-sink-trap",
    text: "Hey sorry, sink trap came loose and flooded under the cabinet, waiting on the super, taking today off.",
    category: "domestic",
    anchor: "loose sink trap",
    concession: true,
    mundaneDetail: 0.92,
  },
  {
    id: "medical-ear-infection",
    text: "Sorry, woke up with a rough ear infection and urgent care is backed up, taking a sick day.",
    category: "medical",
    anchor: "ear infection",
    concession: true,
    mundaneDetail: 0.89,
  },
  {
    id: "caregiving-kid-dropoff",
    text: "Hey sorry, kid threw up before dropoff so I'm home cleaning and watching him, will check Slack later.",
    category: "caregiving",
    anchor: "sick kid before dropoff",
    concession: true,
    mundaneDetail: 0.91,
  },
  {
    id: "medical-pink-eye",
    text: "Morning, caught pink eye from my nephew and waiting on urgent care drops, taking a sick day.",
    category: "medical",
    anchor: "pink eye drops",
    concession: true,
    mundaneDetail: 0.9,
  },
  {
    id: "domestic-building-shutoff",
    text: "Hey sorry, building shut water off for a pipe fix and super needs unit access today, taking PTO.",
    category: "domestic",
    anchor: "building water shutoff",
    concession: true,
    mundaneDetail: 0.91,
  },
  {
    id: "transit-tire-nail",
    text: "Sorry, got a nail in my tire backing out and the shop can't patch it till noon, taking PTO.",
    category: "transit",
    anchor: "nail in tire",
    concession: true,
    mundaneDetail: 0.87,
  },
  {
    id: "dental-chipped-molar",
    text: "Hey sorry, chipped a molar on an almond and dentist can see me at 1, taking today off.",
    category: "dental",
    anchor: "chipped molar",
    concession: true,
    mundaneDetail: 0.93,
  },
  {
    id: "domestic-breaker-drip",
    text: "Morning, basement pipe is dripping near the breaker panel so waiting on landlord's electrician, taking PTO today.",
    category: "domestic",
    anchor: "breaker panel drip",
    concession: true,
    mundaneDetail: 0.9,
  },
  {
    id: "transit-garage-spring",
    text: "Hey sorry, garage spring snapped with my car inside and the repair guy comes at noon, taking PTO.",
    category: "transit",
    anchor: "snapped garage spring",
    concession: true,
    mundaneDetail: 0.89,
  },
];

const HASTY_OPENING_RE = /^(hey|morning|sorry|ugh|quick heads up)\b/i;

const CONTRACTION_RE =
  /\b(can't|won't|don't|didn't|i'm|it's|that's|there's|landlord's|gonna|wanna|gotta|till|cant|wont)\b/gi;

const CORPORATE_JARGON_PATTERNS: readonly RegExp[] = [
  /\bunforeseen\b/i,
  /\bregret to inform\b/i,
  /\bpersonal matter\b/i,
  /\bpersonal emergency\b/i,
  /\binconvenience\b/i,
  /\bkindly\b/i,
  /\bplease be advised\b/i,
  /\bunder the weather\b/i,
  /\bfamily emergency\b/i,
  /\bmental health day\b/i,
];

const CLICHE_PATTERNS: readonly RegExp[] = [
  /\bfood poisoning\b/i,
  /\bmigraine\b/i,
  /\bgrandma\b/i,
  /\bgrandmother\b/i,
  /\bcar won't start\b/i,
  /\bcar broke down\b/i,
  /\bwifi\b/i,
  /\binternet is out\b/i,
  /\bsomething came up\b/i,
  /\bnot feeling well\b/i,
];

const GAMING_LEAK_PATTERNS: readonly RegExp[] = [
  /\bgta\b/i,
  /\bvice city\b/i,
  /\brockstar\b/i,
  /\bconsole\b/i,
  /\bps5\b/i,
  /\bxbox\b/i,
  /\bgame\b/i,
  /\blaunch\b/i,
  /\bdownload\b/i,
  /\bpackage\b/i,
  /\bdelivery\b/i,
];

const CONCRETE_ANCHOR_PATTERNS: readonly RegExp[] = [
  /\b(crown|filling|molar|dentist)\b/i,
  /\b(plumber|super|landlord|electrician|locksmith|maintenance)\b/i,
  /\b(deadbolt|sink trap|water heater|breaker panel|garage spring|pipe)\b/i,
  /\b(urgent care|pink eye|ear infection|swollen|lower back)\b/i,
  /\b(vet|dropoff|nail in my tire)\b/i,
  /\b(\d{1,2}(:\d{2})?\s?(am|pm)?|noon|afternoon)\b/i,
];

const MUNDANE_FRICTION_PATTERNS: readonly RegExp[] = [
  /\b(popped off|snapped|leaking|flooded|dripping|swollen|chipped|threw up|fell out)\b/i,
  /\b(toast|almond|trash|breakfast|cabinet|bathroom|hall|basement|nephew)\b/i,
  /\b(backed up|squeeze me in|quoted|needs unit access|needs me here|waiting on)\b/i,
];

const CONCESSION_PATTERNS: readonly RegExp[] = [
  /\b(taking pto|taking a sick day|taking today off|take today off|take a sick day)\b/i,
  /\b(check slack|back tomorrow|on my phone|answer emails)\b/i,
];

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function countPatternHits(text: string, patterns: readonly RegExp[]): number {
  let hits = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      hits += 1;
    }
  }
  return hits;
}

export function tokenizeWords(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }
  return trimmed.split(/\s+/);
}

export function countWords(text: string): number {
  return tokenizeWords(text).length;
}

export function isValidExcuseLine(
  text: string,
  maxWords: number = MAX_EXCUSE_WORDS,
): boolean {
  if (text.length === 0 || /[\r\n]/.test(text)) {
    return false;
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return false;
  }
  const words = countWords(trimmed);
  return words >= 1 && words <= maxWords;
}

export function extractLinguisticSignals(text: string): ExcuseSignals {
  const isSingleLine = !/[\r\n]/.test(text);
  const trimmed = text.trim();
  const words = tokenizeWords(trimmed);
  const wordCount = words.length;
  const charCount = trimmed.length;
  const withinWordLimit = wordCount >= 1 && wordCount <= MAX_EXCUSE_WORDS;

  const hasHastyOpening = HASTY_OPENING_RE.test(trimmed);
  const contractionMatches = trimmed.match(CONTRACTION_RE);
  const contractionCount = contractionMatches ? contractionMatches.length : 0;

  const corporateJargonHits = countPatternHits(trimmed, CORPORATE_JARGON_PATTERNS);
  const clicheHits = countPatternHits(trimmed, CLICHE_PATTERNS);
  const gamingLeakHits = countPatternHits(trimmed, GAMING_LEAK_PATTERNS);
  const concreteAnchorHits = countPatternHits(trimmed, CONCRETE_ANCHOR_PATTERNS);
  const mundaneFrictionHits = countPatternHits(trimmed, MUNDANE_FRICTION_PATTERNS);
  const concessionHits = countPatternHits(trimmed, CONCESSION_PATTERNS);

  const exclamationMatches = trimmed.match(/!/g);
  const exclamationCount = exclamationMatches ? exclamationMatches.length : 0;

  const letterChars = words.reduce(
    (sum, token) => sum + token.replace(/[^a-z0-9]/gi, "").length,
    0,
  );
  const avgWordLength = wordCount > 0 ? round4(letterChars / wordCount) : 0;

  const sentenceParts = trimmed
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const sentenceCount = sentenceParts.length;

  const idealLengthBonus =
    wordCount >= 14 && wordCount <= 19
      ? 1.0
      : wordCount >= 10 && wordCount <= 20
        ? 0.72
        : 0.2;

  const hasteRaw =
    (hasHastyOpening ? 0.34 : 0) +
    Math.min(contractionCount, 2) * 0.14 +
    (sentenceCount === 1 ? 0.24 : 0.08) +
    (avgWordLength >= 3.6 && avgWordLength <= 5.0 ? 0.18 : 0.06) +
    (exclamationCount === 0 ? 0.1 : -0.15 * exclamationCount);
  const hasteScore = round4(clamp(hasteRaw, 0, 1));

  const credibilityRaw =
    idealLengthBonus * 0.25 +
    Math.min(concreteAnchorHits, 3) * 0.16 +
    Math.min(mundaneFrictionHits, 3) * 0.11 +
    Math.min(concessionHits, 2) * 0.12 -
    corporateJargonHits * 0.32 -
    clicheHits * 0.35 -
    gamingLeakHits * 0.5;
  const credibilityScore = round4(clamp(credibilityRaw, 0, 1));

  const skepticismRaw =
    corporateJargonHits * 0.35 +
    clicheHits * 0.4 +
    gamingLeakHits * 0.65 +
    (exclamationCount > 0 ? 0.12 * exclamationCount : 0) +
    (concreteAnchorHits === 0 ? 0.3 : 0) +
    (wordCount > MAX_EXCUSE_WORDS ? 0.5 : 0) +
    (!isSingleLine ? 0.5 : 0);
  const managerSkepticismRisk = round4(clamp(skepticismRaw, 0, 1));

  const hardValidity = isSingleLine && withinWordLimit ? 1 : 0;
  const compositeScore = round4(
    hardValidity *
      clamp(
        credibilityScore * 0.58 +
          hasteScore * 0.32 +
          (1 - managerSkepticismRisk) * 0.1,
        0,
        1,
      ),
  );

  return {
    wordCount,
    charCount,
    isSingleLine,
    withinWordLimit,
    hasHastyOpening,
    contractionCount,
    corporateJargonHits,
    clicheHits,
    gamingLeakHits,
    concreteAnchorHits,
    mundaneFrictionHits,
    concessionHits,
    exclamationCount,
    avgWordLength,
    sentenceCount,
    hasteScore,
    credibilityScore,
    managerSkepticismRisk,
    compositeScore,
  };
}

export function scoreExcuse(text: string): number {
  return extractLinguisticSignals(text).compositeScore;
}

export function rankCandidates(
  candidates: readonly ExcuseCandidate[] = EXCUSE_CANDIDATES,
): RankedExcuse[] {
  const evaluated: RankedExcuse[] = candidates.map((candidate) => ({
    candidate,
    signals: extractLinguisticSignals(candidate.text),
  }));

  evaluated.sort((a, b) => {
    const scoreA = round4(
      a.signals.compositeScore * 0.82 + a.candidate.mundaneDetail * 0.18,
    );
    const scoreB = round4(
      b.signals.compositeScore * 0.82 + b.candidate.mundaneDetail * 0.18,
    );
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    if (a.signals.managerSkepticismRisk !== b.signals.managerSkepticismRisk) {
      return a.signals.managerSkepticismRisk - b.signals.managerSkepticismRisk;
    }
    if (a.signals.wordCount !== b.signals.wordCount) {
      return a.signals.wordCount - b.signals.wordCount;
    }
    return a.candidate.id.localeCompare(b.candidate.id);
  });

  return evaluated;
}

export function selectBestExcuse(
  candidates: readonly ExcuseCandidate[] = EXCUSE_CANDIDATES,
): RankedExcuse {
  const ranked = rankCandidates(candidates);
  if (ranked.length === 0) {
    throw new Error("No excuse candidates available.");
  }
  return ranked[0];
}