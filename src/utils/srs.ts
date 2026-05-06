/**
 * SRS (Spaced Repetition System) — Core Logic
 * 
 * Tracks per-word error counts in localStorage.
 * Words with many mistakes are automatically surfaced in Unit Review.
 * No pressure: no lives, no penalties — just gentle repetition.
 */

const STORAGE_KEY = 'derdiedas_srs';

export interface SRSEntry {
  wordId: number;
  german: string;
  errorCount: number;
  lastSeen: number;       // timestamp
  lastCorrect: number;    // timestamp
  streak: number;         // consecutive correct answers
}

type SRSData = Record<number, SRSEntry>;

// ─── Persistence ────────────────────────────────────────────

const load = (): SRSData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const save = (data: SRSData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// ─── Public API ─────────────────────────────────────────────

/** Record a correct answer for a word. */
export const recordCorrect = (wordId: number, german: string) => {
  const data = load();
  const entry = data[wordId] || { wordId, german, errorCount: 0, lastSeen: 0, lastCorrect: 0, streak: 0 };
  entry.lastSeen = Date.now();
  entry.lastCorrect = Date.now();
  entry.streak += 1;
  data[wordId] = entry;
  save(data);
};

/** Record an incorrect answer for a word. */
export const recordError = (wordId: number, german: string) => {
  const data = load();
  const entry = data[wordId] || { wordId, german, errorCount: 0, lastSeen: 0, lastCorrect: 0, streak: 0 };
  entry.errorCount += 1;
  entry.lastSeen = Date.now();
  entry.streak = 0; // reset streak on error
  data[wordId] = entry;
  save(data);
};

/** Get words that the user struggles with (errorCount >= threshold). */
export const getWeakWords = (threshold = 2): SRSEntry[] => {
  const data = load();
  return Object.values(data)
    .filter(e => e.errorCount >= threshold)
    .sort((a, b) => {
      // Prioritize: most errors first, then least recently correct
      if (b.errorCount !== a.errorCount) return b.errorCount - a.errorCount;
      return a.lastCorrect - b.lastCorrect;
    });
};

/** Get the SRS entry for a specific word. */
export const getWordStats = (wordId: number): SRSEntry | null => {
  const data = load();
  return data[wordId] || null;
};

/** Get all tracked data (for debug/display). */
export const getAllStats = (): SRSEntry[] => {
  return Object.values(load()).sort((a, b) => b.errorCount - a.errorCount);
};

/** Clear all SRS data (for reset). */
export const resetSRS = () => {
  localStorage.removeItem(STORAGE_KEY);
};
