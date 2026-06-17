import type { DictionaryEntry } from './vocab-types';

let cache: DictionaryEntry[] | null = null;
let inflight: Promise<DictionaryEntry[]> | null = null;

/** Fetch the full dictionary once and cache it in memory for the session. */
export async function loadDictionary(): Promise<DictionaryEntry[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/vocab/dictionary.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load dictionary: ${res.status}`);
      return res.json() as Promise<DictionaryEntry[]>;
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

/** Look up a single entry by its German headword (case-sensitive). */
export async function getEntry(german: string): Promise<DictionaryEntry | undefined> {
  const all = await loadDictionary();
  return all.find((e) => e.word === german);
}
