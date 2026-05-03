import { words, puzzles } from './words';
import { type Word, type SentencePuzzle } from './words';

export type NodeType = 'word' | 'sentence' | 'chest' | 'trophy' | 'review' | 'placeholder' | 'reading' | 'listening' | 'speaking' | 'writing' | 'adventure';

export interface LessonNode {
  id: string;
  type: NodeType;
  title: string;
  items: (Word | SentencePuzzle)[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  unlockRequirement?: string;
  nodes: LessonNode[];
}

export const learningPath: Section[] = [
  {
    id: 'sec1',
    title: 'Unitatea 1: Vocabular',
    description: 'Bazează-te pe cuvinte simple și prima regulă.',
    nodes: [
      { id: 'u1_l1', type: 'word', title: 'Baze 1', items: words.slice(0, 5) },
      { id: 'u1_l2', type: 'word', title: 'Baze 2', items: words.slice(5, 10) },
      { id: 'u1_r1', type: 'reading', title: 'Reading', items: [] },
      { id: 'u1_l3', type: 'word', title: 'Baze 3', items: words.slice(10, 15) },
      { id: 'u1_li1', type: 'listening', title: 'Listening', items: [] },
      { id: 'u1_c1', type: 'chest', title: 'Cufărul Ascuns', items: [] },
      { id: 'u1_l4', type: 'word', title: 'Baze 4', items: words.slice(15, 20) },
      { id: 'u1_s1', type: 'speaking', title: 'Speaking', items: [] },
      { id: 'u1_w1', type: 'writing', title: 'Writing', items: [] },
      { id: 'u1_a1', type: 'adventure', title: 'Aventură', items: [] }
    ]
  },
  {
    id: 'sec2',
    title: 'Unitatea 2: Propoziții',
    description: 'Învață să pui verbul pe locul 2.',
    nodes: [
      { id: 'u2_l1', type: 'sentence', title: 'Propoziții', items: puzzles },
      { id: 'u2_r1', type: 'reading', title: 'Poveste', items: [] },
      { id: 'u2_li1', type: 'listening', title: 'Dialog', items: [] },
      { id: 'u2_s1', type: 'speaking', title: 'Răspunde', items: [] },
      { id: 'u2_w1', type: 'writing', title: 'Formează', items: [] },
      { id: 'u2_a1', type: 'adventure', title: 'Piața', items: [] },
      { id: 'u2_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u2_t1', type: 'trophy', title: 'Maestru U2', items: [] }
    ]
  },
  {
    id: 'sec3',
    title: 'Unitatea 3: Animale',
    description: 'Extindem vocabularul cu faună.',
    unlockRequirement: 'u2_t1',
    nodes: [
      { id: 'u3_l1', type: 'placeholder', title: 'Animale 1', items: [] },
      { id: 'u3_li1', type: 'listening', title: 'Sunete', items: [] },
      { id: 'u3_l2', type: 'placeholder', title: 'Animale 2', items: [] },
      { id: 'u3_a1', type: 'adventure', title: 'La Zoo', items: [] },
      { id: 'u3_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u3_t1', type: 'trophy', title: 'Biolog U3', items: [] }
    ]
  },
  {
    id: 'sec4',
    title: 'Unitatea 4: Mâncare',
    description: 'Comandă la restaurant cu încredere.',
    unlockRequirement: 'u3_t1',
    nodes: [
      { id: 'u4_l1', type: 'placeholder', title: 'Meniul', items: [] },
      { id: 'u4_s1', type: 'speaking', title: 'Comandă', items: [] },
      { id: 'u4_l2', type: 'placeholder', title: 'Băuturi', items: [] },
      { id: 'u4_a1', type: 'adventure', title: 'La Bistro', items: [] },
      { id: 'u4_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u4_t1', type: 'trophy', title: 'Gurmand U4', items: [] }
    ]
  },
  {
    id: 'sec5',
    title: 'Unitatea 5: Călătorii',
    description: 'Vacanțe, aeroporturi și destinații.',
    unlockRequirement: 'u4_t1',
    nodes: [
      { id: 'u5_l1', type: 'placeholder', title: 'Bilete', items: [] },
      { id: 'u5_r1', type: 'reading', title: 'Harta', items: [] },
      { id: 'u5_w1', type: 'writing', title: 'Vederi', items: [] },
      { id: 'u5_a1', type: 'adventure', title: 'Aeroportul', items: [] },
      { id: 'u5_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u5_t1', type: 'trophy', title: 'Explorator U5', items: [] }
    ]
  },
  {
    id: 'sec6',
    title: 'Unitatea 6: Timpul (Avansat)',
    description: 'Exprimă-te în trecut și povestește.',
    unlockRequirement: 'u5_t1',
    nodes: [
      { id: 'u6_l1', type: 'placeholder', title: 'Trecutul', items: [] },
      { id: 'u6_li1', type: 'listening', title: 'Amintiri', items: [] },
      { id: 'u6_s1', type: 'speaking', title: 'Planuri viitor', items: [] },
      { id: 'u6_a1', type: 'adventure', title: 'Mașina Timpului', items: [] },
      { id: 'u6_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u6_t1', type: 'trophy', title: 'Călător U6', items: [] }
    ]
  },
  {
    id: 'sec7',
    title: 'Unitatea 7: Carieră',
    description: 'Termeni de afaceri, birou și interviuri.',
    unlockRequirement: 'u6_t1',
    nodes: [
      { id: 'u7_l1', type: 'placeholder', title: 'CV-ul meu', items: [] },
      { id: 'u7_r1', type: 'reading', title: 'E-mailuri', items: [] },
      { id: 'u7_s1', type: 'speaking', title: 'Ședința', items: [] },
      { id: 'u7_w1', type: 'writing', title: 'Raport', items: [] },
      { id: 'u7_a1', type: 'adventure', title: 'Interviul', items: [] },
      { id: 'u7_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u7_t1', type: 'trophy', title: 'Director U7', items: [] }
    ]
  },
  {
    id: 'sec8',
    title: 'Unitatea 8: Cultură',
    description: 'Idiomuri, expresii și basme nemțești.',
    unlockRequirement: 'u7_t1',
    nodes: [
      { id: 'u8_l1', type: 'placeholder', title: 'Expresii', items: [] },
      { id: 'u8_li1', type: 'listening', title: 'Folclor', items: [] },
      { id: 'u8_r1', type: 'reading', title: 'Poezii', items: [] },
      { id: 'u8_a1', type: 'adventure', title: 'Castelul Neuschwanstein', items: [] },
      { id: 'u8_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u8_t1', type: 'trophy', title: 'Maestru U8', items: [] }
    ]
  }
];
