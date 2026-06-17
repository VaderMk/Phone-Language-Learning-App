export type Article = 'der' | 'die' | 'das';

// Base shape consumed by GenderChallenge / LessonRunner.
export interface Word {
  id: number;
  german: string;
  article: Article;
  translation: string;
  gender: string;
}

// Bundled lesson noun: Word + frequency metadata. Generated into
// src/data/generated/lessonWords.ts by scripts/build-vocab.mjs.
export interface LessonWord extends Word {
  rank: number;
  ipa: string;
}

// ---- Full dictionary shapes (public/vocab/dictionary.json) ----

export interface CaseForms {
  nominative: string;
  accusative: string;
  dative: string;
  genitive: string;
}

export interface NounDeclension {
  singular: { forms: CaseForms; examples: CaseForms };
  plural: { forms: CaseForms; examples: CaseForms };
}

export interface GrammarNoun {
  gender: string;
  plural: string;
  genitive: string;
  declension: NounDeclension;
}

export interface VerbConjugation {
  present: Record<string, string>;
  past: Record<string, string>;
  perfect: Record<string, string>;
}

export interface GrammarVerb {
  infinitive: string;
  past: string;
  participle: string;
  auxiliary: string;
  separable: boolean;
  conjugation: VerbConjugation;
}

export interface LocalizedSentence {
  de: string;
  en: string;
  ro: string;
}

export interface DictionaryEntry {
  word: string;
  rank: number;
  academic_en: string;
  academic_ro: string;
  pos: string;
  ipa: string;
  simple_context: LocalizedSentence;
  detailed_context: LocalizedSentence;
  grammar_noun: GrammarNoun | null;
  grammar_verb: GrammarVerb | null;
}
