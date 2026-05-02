import { words, puzzles } from './words';
import { type Word, type SentencePuzzle } from './words';

export interface LessonNode {
  id: string;
  type: 'word' | 'sentence' | 'chest' | 'trophy';
  title: string;
  items: (Word | SentencePuzzle)[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  nodes: LessonNode[];
}

export const learningPath: Section[] = [
  {
    id: 'sec1',
    title: 'Unitatea 1: Începuturi',
    description: 'Bazează-te pe cuvinte simple și prima regulă a verbului.',
    nodes: [
      { id: 'l1', type: 'word', title: 'Baze 1', items: words.slice(0, 5) },
      { id: 'l2', type: 'word', title: 'Baze 2', items: words.slice(5, 10) },
      { id: 'l3', type: 'word', title: 'Baze 3', items: words.slice(10, 15) },
      { id: 'l4', type: 'word', title: 'Baze 4', items: words.slice(15, 20) },
      { id: 'c1', type: 'chest', title: 'Cufărul Ascuns', items: [] },
      { id: 'l5', type: 'sentence', title: 'Propoziții', items: puzzles },
      { id: 't1', type: 'trophy', title: 'Trofeu: Începător', items: [] }
    ]
  }
];
