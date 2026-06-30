/**
 * Practice content for the Reading / Listening / Speaking / Writing nodes.
 *
 * Exercises are generated from the bundled `lessonWords` frequency list
 * (6.8k+ nouns), so every unit has plenty of non-repeating material. Reading
 * is additionally enriched with real example sentences from the full
 * dictionary (lazy-loaded), falling back to a generated text if unavailable.
 */

import { lessonWords } from './generated/lessonWords';
import { loadDictionary } from './dictionary';
import type { Word, DictionaryEntry } from './vocab-types';

// ─── Types ──────────────────────────────────────────────────

export interface ReadingQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface ReadingExercise {
  text: string;
  questions: ReadingQuestion[];
}

export interface ListeningItem {
  /** German text spoken aloud via TTS. */
  audio: string;
  prompt: string;
  options: string[];
  correct: number;
}

export interface SpeakingItem {
  german: string;
  translation: string;
}

export interface WritingItem {
  prompt: string;
  /** Canonical accepted answer (German). */
  answer: string;
  /** Optional alternative accepted answers. */
  accepted?: string[];
}

// ─── Helpers ────────────────────────────────────────────────

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const unitOf = (nodeId: string): number => {
  const m = nodeId.match(/^u(\d+)_/);
  return m ? parseInt(m[1], 10) : 1;
};

/**
 * Distinct frequency band per unit. Early units draw the most frequent
 * (easiest) words; later units progress into rarer vocabulary.
 */
const POOL_SIZE = 60;
const BAND_STEP = 40;

const poolForUnit = (unitNum: number): Word[] => {
  const start = Math.max(0, (unitNum - 1) * BAND_STEP);
  let pool = lessonWords.slice(start, start + POOL_SIZE);
  if (pool.length < 20) pool = lessonWords.slice(0, POOL_SIZE);
  return pool;
};

/** Build a multiple-choice options array with the correct answer mixed in. */
const buildOptions = (correct: string, distractorPool: string[], count = 4) => {
  const uniqueDistractors = [...new Set(distractorPool.filter((d) => d && d !== correct))];
  const distractors = shuffle(uniqueDistractors).slice(0, count - 1);
  const options = shuffle([correct, ...distractors]);
  return { options, correct: options.indexOf(correct) };
};

const withArticle = (word: Word) => `${word.article} ${word.german}`;

// ─── Curated reading content (hand-written, highest quality) ──

const curatedReading: Record<string, ReadingExercise> = {
  u1_r1: {
    text: 'Das ist ein Haus. Das Haus ist groß. Im Haus ist ein Tisch und ein Stuhl. Auf dem Tisch liegt ein Buch. Neben dem Buch steht eine Lampe. Die Familie wohnt hier.',
    questions: [
      { question: 'Despre ce este textul?', options: ['Despre o casă', 'Despre o mașină', 'Despre un animal', 'Despre un oraș'], correct: 0 },
      { question: 'Ce se află pe masă (auf dem Tisch)?', options: ['O lampă', 'O carte (ein Buch)', 'Un telefon', 'O geantă'], correct: 1 },
      { question: 'Cum este casa (das Haus)?', options: ['Mică (klein)', 'Mare (groß)', 'Nouă (neu)', 'Veche (alt)'], correct: 1 },
      { question: 'Ce stă lângă carte (neben dem Buch)?', options: ['Un scaun', 'O lampă (eine Lampe)', 'O ușă', 'O masă'], correct: 1 },
      { question: 'Cine locuiește aici?', options: ['Familia (die Familie)', 'Profesorul', 'Un câine', 'Nimeni'], correct: 0 },
    ],
  },
  u2_r1: {
    text: 'Anna trinkt Kaffee. Sie isst auch ein Brot. Der Kaffee ist heiß und das Brot ist frisch. Anna ist glücklich. Danach geht sie zur Arbeit.',
    questions: [
      { question: 'Ce bea Anna?', options: ['Ceai (Tee)', 'Apă (Wasser)', 'Cafea (Kaffee)', 'Lapte (Milch)'], correct: 2 },
      { question: 'Cum este pâinea (das Brot)?', options: ['Proaspătă (frisch)', 'Veche (alt)', 'Rece (kalt)', 'Tare (hart)'], correct: 0 },
      { question: 'Cum se simte Anna?', options: ['Tristă (traurig)', 'Fericită (glücklich)', 'Obosită (müde)', 'Bolnavă (krank)'], correct: 1 },
      { question: 'Cum este cafeaua (der Kaffee)?', options: ['Rece (kalt)', 'Fierbinte (heiß)', 'Dulce (süß)', 'Amară (bitter)'], correct: 1 },
      { question: 'Unde merge Anna după aceea (danach)?', options: ['Acasă', 'La școală', 'La muncă (zur Arbeit)', 'La magazin'], correct: 2 },
    ],
  },
  u5_r1: {
    text: 'Tom fährt nach Berlin. Er hat ein Ticket und einen Koffer. Der Zug ist schnell. In Berlin besucht Tom ein Museum und ein Hotel. Die Reise ist schön.',
    questions: [
      { question: 'Unde merge Tom?', options: ['La München', 'La Berlin', 'La Hamburg', 'La Köln'], correct: 1 },
      { question: 'Cu ce călătorește Tom?', options: ['Cu trenul (der Zug)', 'Cu mașina (das Auto)', 'Cu avionul', 'Pe jos'], correct: 0 },
      { question: 'Ce vizitează Tom în Berlin?', options: ['Un restaurant', 'Un parc', 'Un muzeu (ein Museum)', 'O școală'], correct: 2 },
      { question: 'Ce are Tom la el?', options: ['O hartă', 'Un bilet și o valiză (Ticket und Koffer)', 'Un câine', 'Doar bani'], correct: 1 },
      { question: 'Cum este călătoria (die Reise)?', options: ['Frumoasă (schön)', 'Plictisitoare', 'Scurtă', 'Scumpă'], correct: 0 },
    ],
  },
};

// ─── Reading ────────────────────────────────────────────────

/** Synchronous reading fallback built from the unit's frequency band. */
const generatedReading = (nodeId: string): ReadingExercise => {
  const pool = poolForUnit(unitOf(nodeId));
  const picks = shuffle(pool).slice(0, 10);
  const text = picks.map((word) => `${withArticle(word)} — ${word.translation}.`).join(' ');
  const questions: ReadingQuestion[] = shuffle(picks).map((target) => {
    const { options, correct } = buildOptions(
      target.translation,
      pool.map((p) => p.translation),
    );
    return { question: `Ce înseamnă „${target.german}"?`, options, correct };
  });
  return { text, questions };
};

/** Immediate reading content — curated when available, otherwise generated. */
export const getReadingExercise = (nodeId: string): ReadingExercise =>
  curatedReading[nodeId] ?? generatedReading(nodeId);

/**
 * Rich reading enriched with real example sentences from the dictionary.
 * Falls back to the synchronous version if the dictionary can't be loaded.
 */
export const getRichReadingExercise = async (nodeId: string): Promise<ReadingExercise> => {
  if (curatedReading[nodeId]) return curatedReading[nodeId];

  try {
    const dict = await loadDictionary();
    const unitNum = unitOf(nodeId);
    const rankStart = Math.max(0, (unitNum - 1) * BAND_STEP);
    const rankEnd = rankStart + 400;

    const usable = dict.filter(
      (e: DictionaryEntry) =>
        e.simple_context?.de &&
        e.simple_context?.ro &&
        e.rank >= rankStart &&
        e.rank <= rankEnd,
    );
    if (usable.length < 4) return generatedReading(nodeId);

    const picks = shuffle(usable).slice(0, 4);
    const text = picks.map((e) => e.simple_context.de).join(' ');

    const roPool = usable.map((e) => e.academic_ro).filter(Boolean);
    const questions: ReadingQuestion[] = picks.map((entry) => {
      const { options, correct } = buildOptions(entry.academic_ro, roPool);
      return { question: `Ce înseamnă „${entry.word}" în text?`, options, correct };
    });

    return { text, questions };
  } catch {
    return generatedReading(nodeId);
  }
};

// ─── Vocabulary lessons (placeholder nodes) ─────────────────

/**
 * Real vocabulary for a `placeholder` lesson node (e.g. "Lecția 1",
 * "Gramatică") so it teaches words instead of showing a blank screen.
 * Different lesson slots within a unit get distinct sub-bands.
 */
export const getLessonWords = (nodeId: string, count = 5): Word[] => {
  const pool = poolForUnit(unitOf(nodeId));
  // Offset by the lesson slot number so l1 and l2 don't repeat words.
  const slotMatch = nodeId.match(/_l(\d+)$/);
  const slot = slotMatch ? parseInt(slotMatch[1], 10) - 1 : 0;
  const start = (slot * count) % Math.max(1, pool.length - count);
  const slice = pool.slice(start, start + count);
  return slice.length >= count ? slice : pool.slice(0, count);
};

// ─── Listening / Speaking / Writing ─────────────────────────

export const getListeningItems = (nodeId: string, count = 12): ListeningItem[] => {
  const pool = poolForUnit(unitOf(nodeId));
  const picks = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picks.map((word) => {
    const { options, correct } = buildOptions(
      word.translation,
      pool.map((p) => p.translation),
    );
    return {
      audio: withArticle(word),
      prompt: 'Ce ai auzit? Alege traducerea corectă.',
      options,
      correct,
    };
  });
};

export const getSpeakingItems = (nodeId: string, count = 12): SpeakingItem[] => {
  const pool = poolForUnit(unitOf(nodeId));
  const picks = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picks.map((word) => ({
    german: withArticle(word),
    translation: word.translation,
  }));
};

export const getWritingItems = (nodeId: string, count = 12): WritingItem[] => {
  const pool = poolForUnit(unitOf(nodeId));
  const picks = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picks.map((word) => ({
    prompt: word.translation,
    answer: `${word.article} ${word.german}`,
    // Accept the bare noun too, so learners aren't blocked on the article.
    accepted: [word.german, `${word.article} ${word.german}`],
  }));
};
