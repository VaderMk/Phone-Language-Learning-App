export type Article = 'der' | 'die' | 'das';

export interface Word {
  id: number;
  german: string;
  article: Article;
  translation: string;
  gender: string;
}

export const words: Word[] = [
  { id: 1, german: 'Kaffee', article: 'der', translation: 'cafea', gender: 'Masculin' },
  { id: 2, german: 'Tee', article: 'der', translation: 'ceai', gender: 'Masculin' },
  { id: 3, german: 'Tisch', article: 'der', translation: 'masă', gender: 'Masculin' },
  { id: 4, german: 'Stuhl', article: 'der', translation: 'scaun', gender: 'Masculin' },
  { id: 5, german: 'Apfel', article: 'der', translation: 'măr', gender: 'Masculin' },
  { id: 6, german: 'Tasche', article: 'die', translation: 'geantă', gender: 'Feminin' },
  { id: 7, german: 'Tasse', article: 'die', translation: 'ceașcă', gender: 'Feminin' },
  { id: 8, german: 'Gabel', article: 'die', translation: 'furculiță', gender: 'Feminin' },
  { id: 9, german: 'Lampe', article: 'die', translation: 'lampă', gender: 'Feminin' },
  { id: 10, german: 'Tür', article: 'die', translation: 'ușă', gender: 'Feminin' },
  { id: 11, german: 'Wasser', article: 'das', translation: 'apă', gender: 'Neutru' },
  { id: 12, german: 'Brot', article: 'das', translation: 'pâine', gender: 'Neutru' },
  { id: 13, german: 'Buch', article: 'das', translation: 'carte', gender: 'Neutru' },
  { id: 14, german: 'Handy', article: 'das', translation: 'telefon', gender: 'Neutru' },
  { id: 15, german: 'Auto', article: 'das', translation: 'mașină', gender: 'Neutru' },
  { id: 16, german: 'Messer', article: 'das', translation: 'cuțit', gender: 'Neutru' },
  { id: 17, german: 'Löffel', article: 'der', translation: 'lingură', gender: 'Masculin' },
  { id: 18, german: 'Zeitung', article: 'die', translation: 'ziar', gender: 'Feminin' },
  { id: 19, german: 'Haus', article: 'das', translation: 'casă', gender: 'Neutru' },
  { id: 20, german: 'Hund', article: 'der', translation: 'câine', gender: 'Masculin' },
];

export type WordCategory = 'noun' | 'verb' | 'pronoun';

export interface PuzzleWord {
  id: string;
  text: string;
  category: WordCategory;
  article?: Article;
}

export interface SentencePuzzle {
  id: number;
  translation: string;
  parts: PuzzleWord[];
}

export const puzzles: SentencePuzzle[] = [
  {
    id: 1,
    translation: 'Eu beau cafea',
    parts: [
      { id: '1', text: 'Ich', category: 'pronoun' },
      { id: '2', text: 'trinke', category: 'verb' },
      { id: '3', text: 'Kaffee', category: 'noun', article: 'der' }
    ]
  },
  {
    id: 2,
    translation: 'Eu mănânc măr',
    parts: [
      { id: '1', text: 'Ich', category: 'pronoun' },
      { id: '2', text: 'esse', category: 'verb' },
      { id: '3', text: 'Apfel', category: 'noun', article: 'der' }
    ]
  },
  {
    id: 3,
    translation: 'Eu am apă',
    parts: [
      { id: '1', text: 'Ich', category: 'pronoun' },
      { id: '2', text: 'habe', category: 'verb' },
      { id: '3', text: 'Wasser', category: 'noun', article: 'das' }
    ]
  },
  {
    id: 4,
    translation: 'Eu beau ceai',
    parts: [
      { id: '1', text: 'Ich', category: 'pronoun' },
      { id: '2', text: 'trinke', category: 'verb' },
      { id: '3', text: 'Tee', category: 'noun', article: 'der' }
    ]
  },
  {
    id: 5,
    translation: 'Eu mănânc pâine',
    parts: [
      { id: '1', text: 'Ich', category: 'pronoun' },
      { id: '2', text: 'esse', category: 'verb' },
      { id: '3', text: 'Brot', category: 'noun', article: 'das' }
    ]
  }
];
