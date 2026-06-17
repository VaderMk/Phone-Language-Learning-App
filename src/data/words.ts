export type { Article, Word } from './vocab-types';
import type { Article, Word } from './vocab-types';

export const basicWords: Word[] = [
  { id: 1, german: 'Tisch', article: 'der', translation: 'masă', gender: 'Masculin' },
  { id: 2, german: 'Stuhl', article: 'der', translation: 'scaun', gender: 'Masculin' },
  { id: 3, german: 'Tasche', article: 'die', translation: 'geantă', gender: 'Feminin' },
  { id: 4, german: 'Lampe', article: 'die', translation: 'lampă', gender: 'Feminin' },
  { id: 5, german: 'Tür', article: 'die', translation: 'ușă', gender: 'Feminin' },
  { id: 6, german: 'Buch', article: 'das', translation: 'carte', gender: 'Neutru' },
  { id: 7, german: 'Handy', article: 'das', translation: 'telefon', gender: 'Neutru' },
  { id: 8, german: 'Auto', article: 'das', translation: 'mașină', gender: 'Neutru' },
  { id: 9, german: 'Zeitung', article: 'die', translation: 'ziar', gender: 'Feminin' },
  { id: 10, german: 'Haus', article: 'das', translation: 'casă', gender: 'Neutru' },
];

export const foodWords: Word[] = [
  { id: 11, german: 'Kaffee', article: 'der', translation: 'cafea', gender: 'Masculin' },
  { id: 12, german: 'Tee', article: 'der', translation: 'ceai', gender: 'Masculin' },
  { id: 13, german: 'Apfel', article: 'der', translation: 'măr', gender: 'Masculin' },
  { id: 14, german: 'Käse', article: 'der', translation: 'brânză', gender: 'Masculin' },
  { id: 15, german: 'Milch', article: 'die', translation: 'lapte', gender: 'Feminin' },
  { id: 16, german: 'Tasse', article: 'die', translation: 'ceașcă', gender: 'Feminin' },
  { id: 17, german: 'Wasser', article: 'das', translation: 'apă', gender: 'Neutru' },
  { id: 18, german: 'Brot', article: 'das', translation: 'pâine', gender: 'Neutru' },
  { id: 19, german: 'Gabel', article: 'die', translation: 'furculiță', gender: 'Feminin' },
  { id: 20, german: 'Messer', article: 'das', translation: 'cuțit', gender: 'Neutru' },
  { id: 21, german: 'Löffel', article: 'der', translation: 'lingură', gender: 'Masculin' },
];

export const animalWords: Word[] = [
  { id: 22, german: 'Hund', article: 'der', translation: 'câine', gender: 'Masculin' },
  { id: 23, german: 'Katze', article: 'die', translation: 'pisică', gender: 'Feminin' },
  { id: 24, german: 'Maus', article: 'die', translation: 'șoarece', gender: 'Feminin' },
  { id: 25, german: 'Vogel', article: 'der', translation: 'pasăre', gender: 'Masculin' },
  { id: 26, german: 'Pferd', article: 'das', translation: 'cal', gender: 'Neutru' },
  { id: 27, german: 'Bär', article: 'der', translation: 'urs', gender: 'Masculin' },
  { id: 28, german: 'Schwein', article: 'das', translation: 'porc', gender: 'Neutru' },
];

export const words: Word[] = [...basicWords, ...foodWords, ...animalWords];

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
