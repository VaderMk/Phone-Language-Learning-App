import { puzzles, basicWords, animalWords, foodWords } from './words';
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

const generateStandardNodes = (unitNum: number, unitTitle: string): LessonNode[] => [
  { id: `u${unitNum}_l1`, type: 'placeholder', title: `Lecția 1: ${unitTitle}`, items: [] },
  { id: `u${unitNum}_l2`, type: 'placeholder', title: 'Gramatică', items: [] },
  { id: `u${unitNum}_r1`, type: 'reading', title: 'Citire', items: [] },
  { id: `u${unitNum}_s1`, type: 'speaking', title: 'Vorbire', items: [] },
  { id: `u${unitNum}_a1`, type: 'adventure', title: 'Aventură', items: [] },
  { id: `u${unitNum}_review`, type: 'review', title: 'Unit Review', items: [] },
  { id: `u${unitNum}_t1`, type: 'trophy', title: `Maestru U${unitNum}`, items: [] }
];

export const learningPath: Section[] = [
  {
    id: 'sec1',
    title: 'Unitatea 1: Vocabular',
    description: 'Bazează-te pe cuvinte simple și prima regulă.',
    nodes: [
      { id: 'u1_l1', type: 'word', title: 'Baze 1', items: basicWords.slice(0, 3) },
      { id: 'u1_l2', type: 'word', title: 'Baze 2', items: basicWords.slice(3, 6) },
      { id: 'u1_r1', type: 'reading', title: 'Reading', items: [] },
      { id: 'u1_l3', type: 'word', title: 'Baze 3', items: basicWords.slice(6, 8) },
      { id: 'u1_li1', type: 'listening', title: 'Listening', items: [] },
      { id: 'u1_c1', type: 'chest', title: 'Cufărul Ascuns', items: [] },
      { id: 'u1_l4', type: 'word', title: 'Baze 4', items: basicWords.slice(8, 10) },
      { id: 'u1_s1', type: 'speaking', title: 'Speaking', items: [] },
      { id: 'u1_w1', type: 'writing', title: 'Writing', items: [] },
      { id: 'u1_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u1_t1', type: 'trophy', title: 'Maestru U1', items: [] }
    ]
  },
  {
    id: 'sec2',
    title: 'Unitatea 2: Propoziții',
    description: 'Învață să pui verbul pe locul 2.',
    unlockRequirement: 'u1_t1',
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
      { id: 'u3_l1', type: 'word', title: 'Animale 1', items: animalWords.slice(0, 4) },
      { id: 'u3_li1', type: 'listening', title: 'Sunete', items: [] },
      { id: 'u3_l2', type: 'word', title: 'Animale 2', items: animalWords.slice(4, 7) },
      { id: 'u3_c1', type: 'chest', title: 'Safari', items: [] },
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
      { id: 'u4_l1', type: 'word', title: 'Meniul', items: foodWords.slice(0, 5) },
      { id: 'u4_s1', type: 'speaking', title: 'Comandă', items: [] },
      { id: 'u4_l2', type: 'word', title: 'Băuturi', items: foodWords.slice(5, 11) },
      { id: 'u4_c1', type: 'chest', title: 'Cufărul Bucătarului', items: [] },
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
      { id: 'u5_c1', type: 'chest', title: 'Bagajul Pierdut', items: [] },
      { id: 'u5_a1', type: 'adventure', title: 'Aeroportul', items: [] },
      { id: 'u5_review', type: 'review', title: 'Unit Review', items: [] },
      { id: 'u5_t1', type: 'trophy', title: 'Explorator U5', items: [] }
    ]
  },
  { id: 'sec6', title: 'Unitatea 6: Subordonate', description: 'weil, dass - verbul la final.', unlockRequirement: 'u5_t1', nodes: generateStandardNodes(6, 'Subordonate') },
  { id: 'sec7', title: 'Unitatea 7: Perfekt', description: 'haben/sein + Participiu.', unlockRequirement: 'u6_t1', nodes: generateStandardNodes(7, 'Trecut') },
  { id: 'sec8', title: 'Unitatea 8: Dativ & Prepoziții', description: 'Prepoziții de loc (Wechselpräpositionen).', unlockRequirement: 'u7_t1', nodes: generateStandardNodes(8, 'Dativ') },
  { id: 'sec9', title: 'Unitatea 9: Verbe Modale', description: 'müssen, können, sollen.', unlockRequirement: 'u8_t1', nodes: generateStandardNodes(9, 'Modale') },
  { id: 'sec10', title: 'Unitatea 10: Declinația 1', description: 'Declinația Adjectivului (Nominativ).', unlockRequirement: 'u9_t1', nodes: generateStandardNodes(10, 'Adjective 1') },
  { id: 'sec11', title: 'Unitatea 11: Declinația 2', description: 'Declinația Adjectivului (Acuzativ).', unlockRequirement: 'u10_t1', nodes: generateStandardNodes(11, 'Adjective 2') },
  { id: 'sec12', title: 'Unitatea 12: Declinația 3', description: 'Declinația Adjectivului (Dativ).', unlockRequirement: 'u11_t1', nodes: generateStandardNodes(12, 'Adjective 3') },
  { id: 'sec13', title: 'Unitatea 13: Genitivul', description: 'Apostroful nemțesc și posesia.', unlockRequirement: 'u12_t1', nodes: generateStandardNodes(13, 'Genitiv') },
  { id: 'sec14', title: 'Unitatea 14: Pasivul', description: 'Când acțiunea contează mai mult.', unlockRequirement: 'u13_t1', nodes: generateStandardNodes(14, 'Pasiv') },
  { id: 'sec15', title: 'Unitatea 15: Konjunktiv II', description: 'Dorințe și situații ireale (Prezent).', unlockRequirement: 'u14_t1', nodes: generateStandardNodes(15, 'Konjunktiv II') },
  { id: 'sec16', title: 'Unitatea 16: Viitorul I', description: 'Ce vei face mâine? (Futur I).', unlockRequirement: 'u15_t1', nodes: generateStandardNodes(16, 'Viitor') },
  { id: 'sec17', title: 'Unitatea 17: Prop. Relative', description: 'Care, pe care, căruia...', unlockRequirement: 'u16_t1', nodes: generateStandardNodes(17, 'Relative') },
  { id: 'sec18', title: 'Unitatea 18: Verbe Reflexive', description: 'A se spăla, a se grăbi.', unlockRequirement: 'u17_t1', nodes: generateStandardNodes(18, 'Reflexive') },
  { id: 'sec19', title: 'Unitatea 19: Imperativul', description: 'Dă comenzi politicos și direct.', unlockRequirement: 'u18_t1', nodes: generateStandardNodes(19, 'Imperativ') },
  { id: 'sec20', title: 'Unitatea 20: Prep. cu Genitivul', description: 'Wegen, trotz, während.', unlockRequirement: 'u19_t1', nodes: generateStandardNodes(20, 'Prepoziții Avansate') },
  { id: 'sec21', title: 'Unitatea 21: Konjunktiv I', description: 'Vorbirea indirectă la știri.', unlockRequirement: 'u20_t1', nodes: generateStandardNodes(21, 'Konjunktiv I') },
  { id: 'sec22', title: 'Unitatea 22: Plusquamperfekt', description: 'Trecutul trecutului.', unlockRequirement: 'u21_t1', nodes: generateStandardNodes(22, 'Mai mult ca perfect') },
  { id: 'sec23', title: 'Unitatea 23: Viitorul II', description: 'Ce vei fi făcut până mâine (Futur II).', unlockRequirement: 'u22_t1', nodes: generateStandardNodes(23, 'Futur II') },
  { id: 'sec24', title: 'Unitatea 24: Participiul ca Adjectiv', description: 'Der lachende Mann.', unlockRequirement: 'u23_t1', nodes: generateStandardNodes(24, 'Participii') },
  { id: 'sec25', title: 'Unitatea 25: Pasiv cu Modale', description: 'Das muss gemacht werden.', unlockRequirement: 'u24_t1', nodes: generateStandardNodes(25, 'Master') },
];
