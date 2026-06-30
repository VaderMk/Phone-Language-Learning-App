/**
 * Sub-project 2 — new lesson types powered by the rich dictionary grammar:
 *   • Conjugation  (verbs: present / past / perfect)
 *   • Declension   (nouns: 4 cases × singular/plural)
 *   • Flashcard    (any word: German + IPA + example, reveal translation)
 *
 * All content is pulled lazily from the full dictionary, filtered to a
 * frequency band per unit so each unit has distinct, non-repeating items.
 */

import { loadDictionary } from './dictionary';
import type { DictionaryEntry } from './vocab-types';

// ─── Types ──────────────────────────────────────────────────

export interface ConjugationItem {
  infinitive: string;
  translation: string;
  tense: 'present' | 'past' | 'perfect';
  tenseLabel: string;
  pronoun: string;
  answer: string;
  options: string[];
  correct: number;
}

export interface DeclensionItem {
  noun: string;
  translation: string;
  caseLabel: string;
  numberLabel: string;
  answer: string;
  options: string[];
  correct: number;
  example: string;
}

export interface FlashcardItem {
  german: string;
  translation: string;
  ipa: string;
  pos: string;
  exampleDe: string;
  exampleRo: string;
}

// ─── Helpers ────────────────────────────────────────────────

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const unitOf = (nodeId: string): number => {
  const m = nodeId.match(/^u(\d+)_/);
  return m ? parseInt(m[1], 10) : 1;
};

/** Wide rank window per unit so there are always enough verbs/nouns. */
const rankBand = (unitNum: number) => {
  const start = Math.max(0, (unitNum - 1) * 40);
  return { start, end: start + 800 };
};

const buildOptions = (correct: string, pool: string[], count = 4) => {
  const distractors = shuffle([...new Set(pool.filter((d) => d && d !== correct))]).slice(0, count - 1);
  const options = shuffle([correct, ...distractors]);
  return { options, correct: options.indexOf(correct) };
};

const PRONOUN_LABEL: Record<string, string> = {
  ich: 'ich',
  du: 'du',
  er_sie_es: 'er/sie/es',
  wir: 'wir',
  ihr: 'ihr',
  sie_Sie: 'sie/Sie',
};

const TENSE_LABEL: Record<string, string> = {
  present: 'Prezent (Präsens)',
  past: 'Imperfect (Präteritum)',
  perfect: 'Perfect (Perfekt)',
};

const CASE_LABEL: Record<string, string> = {
  nominative: 'Nominativ',
  accusative: 'Acuzativ',
  dative: 'Dativ',
  genitive: 'Genitiv',
};

const isVerb = (e: DictionaryEntry) => e.pos === 'v' || e.pos.includes('verb');

// Conjugation forms in the data are inconsistent: some include the pronoun
// and/or trailing punctuation (e.g. "er vergisst;"), others are bare ("ist").
// Normalize to the bare verb form so the prompt's pronoun isn't duplicated.
const PRONOUN_TOKENS = new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man']);
const cleanVerbForm = (raw: string): string => {
  let s = (raw ?? '').trim().replace(/[;,.]+$/, '').trim();
  const parts = s.split(/\s+/);
  if (parts.length > 1 && PRONOUN_TOKENS.has(parts[0].toLowerCase())) {
    s = parts.slice(1).join(' ');
  }
  return s;
};

const inBand = (e: DictionaryEntry, unitNum: number) => {
  const { start, end } = rankBand(unitNum);
  return e.rank >= start && e.rank <= end;
};

// ─── Conjugation ────────────────────────────────────────────

export const getConjugationItems = async (nodeId: string, count = 10): Promise<ConjugationItem[]> => {
  const dict = await loadDictionary();
  const unitNum = unitOf(nodeId);

  let verbs = dict.filter(
    (e) => isVerb(e) && e.grammar_verb?.conjugation?.present?.ich && e.academic_ro && inBand(e, unitNum),
  );
  if (verbs.length < count) {
    verbs = dict.filter((e) => isVerb(e) && e.grammar_verb?.conjugation?.present?.ich && e.academic_ro);
  }

  const tenses: Array<'present' | 'past' | 'perfect'> = ['present', 'past', 'perfect'];
  const pronouns = Object.keys(PRONOUN_LABEL);

  return shuffle(verbs)
    .slice(0, count)
    .map((entry, i) => {
      const conj = entry.grammar_verb!.conjugation;
      // Early items stay in the present; later ones rotate through all tenses.
      const tense = i < 3 ? 'present' : tenses[i % tenses.length];
      const pronoun = pronouns[i % pronouns.length];
      const answer = cleanVerbForm(conj[tense][pronoun]);

      // Distractors: the verb's own forms across persons/tenses (plausible).
      const ownForms = tenses.flatMap((t) => pronouns.map((p) => cleanVerbForm(conj[t][p])));
      const { options, correct } = buildOptions(answer, ownForms);

      return {
        infinitive: entry.grammar_verb!.infinitive || entry.word,
        translation: entry.academic_ro,
        tense,
        tenseLabel: TENSE_LABEL[tense],
        pronoun: PRONOUN_LABEL[pronoun],
        answer,
        options,
        correct,
      };
    })
    .filter((it) => it.answer && it.options.length >= 2);
};

// ─── Declension ─────────────────────────────────────────────

export const getDeclensionItems = async (nodeId: string, count = 10): Promise<DeclensionItem[]> => {
  const dict = await loadDictionary();
  const unitNum = unitOf(nodeId);

  let nouns = dict.filter(
    (e) => e.grammar_noun?.declension?.singular?.forms && e.academic_ro && inBand(e, unitNum),
  );
  if (nouns.length < count) {
    nouns = dict.filter((e) => e.grammar_noun?.declension?.singular?.forms && e.academic_ro);
  }

  const cases = ['nominative', 'accusative', 'dative', 'genitive'] as const;

  return shuffle(nouns)
    .slice(0, count)
    .map((entry, i) => {
      const decl = entry.grammar_noun!.declension;
      // Mostly singular; occasionally plural for variety.
      const usePlural = i % 4 === 3 && decl.plural?.forms;
      const number = usePlural ? decl.plural : decl.singular;
      const numberLabel = usePlural ? 'plural' : 'singular';
      const kase = cases[i % cases.length];
      const answer = number.forms[kase];

      // Natural 4-option set: the four case forms of this number, padded
      // with the other number's forms if some coincide.
      const pool = [
        ...cases.map((c) => number.forms[c]),
        ...(decl.plural?.forms ? cases.map((c) => decl.plural.forms[c]) : []),
        ...cases.map((c) => decl.singular.forms[c]),
      ];
      const { options, correct } = buildOptions(answer, pool);

      return {
        noun: decl.singular.forms.nominative,
        translation: entry.academic_ro,
        caseLabel: CASE_LABEL[kase],
        numberLabel,
        answer,
        options,
        correct,
        example: number.examples?.[kase] ?? '',
      };
    })
    .filter((it) => it.answer && it.options.length >= 2);
};

// ─── Adventure (comprehension dialogue) ─────────────────────

export interface AdventureLine {
  de: string;
  ro: string;
  options: Array<{ text: string; correct: boolean }>;
}

/**
 * Build a short comprehension dialogue from real example sentences: read the
 * German line, pick its correct Romanian meaning. Used as the dynamic
 * fallback for adventure nodes without a hand-scripted story.
 */
export const getAdventureLines = async (nodeId: string, count = 4): Promise<AdventureLine[]> => {
  const dict = await loadDictionary();
  const unitNum = unitOf(nodeId);

  let pool = dict.filter((e) => e.simple_context?.de && e.simple_context?.ro && inBand(e, unitNum));
  if (pool.length < count + 3) {
    pool = dict.filter((e) => e.simple_context?.de && e.simple_context?.ro);
  }

  const roPool = pool.map((e) => e.simple_context.ro);
  return shuffle(pool)
    .slice(0, count)
    .map((entry) => {
      const ro = entry.simple_context.ro;
      const distractors = shuffle([...new Set(roPool.filter((r) => r && r !== ro))]).slice(0, 2);
      const options = shuffle([
        { text: ro, correct: true },
        ...distractors.map((d) => ({ text: d, correct: false })),
      ]);
      return { de: entry.simple_context.de, ro, options };
    });
};

// ─── Flashcards ─────────────────────────────────────────────

export const getFlashcardItems = async (nodeId: string, count = 10): Promise<FlashcardItem[]> => {
  const dict = await loadDictionary();
  const unitNum = unitOf(nodeId);

  // Prefer verbs / adjectives / adverbs — words the gender game can't teach.
  const isStudyWord = (e: DictionaryEntry) =>
    isVerb(e) || e.pos.startsWith('adj') || e.pos.startsWith('adv') || e.pos === 'n';

  let words = dict.filter(
    (e) => isStudyWord(e) && e.academic_ro && e.simple_context?.de && inBand(e, unitNum),
  );
  if (words.length < count) {
    words = dict.filter((e) => isStudyWord(e) && e.academic_ro && e.simple_context?.de);
  }

  return shuffle(words)
    .slice(0, count)
    .map((entry) => ({
      german: entry.word,
      translation: entry.academic_ro,
      ipa: entry.ipa ?? '',
      pos: entry.pos,
      exampleDe: entry.simple_context.de,
      exampleRo: entry.simple_context.ro ?? '',
    }));
};
