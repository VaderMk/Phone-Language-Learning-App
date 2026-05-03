import React, { useState, useEffect } from 'react';
import { type LessonNode } from '../data/path';
import { type Word, type SentencePuzzle as SentencePuzzleType, words, puzzles } from '../data/words';
import { GenderChallenge } from './GenderChallenge';
import { SentencePuzzle } from './SentencePuzzle';
import { ProgressTracker } from './ProgressTracker';
import { AdventureMode } from './AdventureMode';
import { motion } from 'framer-motion';

interface LessonRunnerProps {
  node: LessonNode;
  onComplete: () => void;
  onBack: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({ node, onComplete, onBack, showOtto }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dynamicItems, setDynamicItems] = useState<(Word | SentencePuzzleType)[]>(node.items);

  useEffect(() => {
    if (node.type === 'review') {
      // Generate dynamic review items
      const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
      const shuffledPuzzles = [...puzzles].sort(() => Math.random() - 0.5).slice(0, 2);
      const mixed = [...shuffledWords, ...shuffledPuzzles].sort(() => Math.random() - 0.5);
      setDynamicItems(mixed);
    } else {
      setDynamicItems(node.items);
    }
  }, [node]);

  // If it's a chest or trophy, just show a claim screen
  if (node.type === 'chest' || node.type === 'trophy') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-md p-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
        >
          {node.type === 'chest' ? '🎁' : '🏆'}
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-4">
          {node.type === 'chest' ? 'Ai găsit un Cufăr!' : 'Ai obținut Trofeul!'}
        </h2>
        <p className="text-slate-300 mb-12">
          Aceasta este o recompensă opțională pentru determinarea ta! Nu implică presiune sau penalizări.
        </p>
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl text-lg font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-4 border-amber-600 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
        >
          Revendică
        </button>
      </div>
    );
  }

  // If it's an adventure node
  if (node.type === 'adventure') {
    return (
      <div className="flex-1 flex flex-col justify-center h-full w-full">
        <div className="flex items-center pt-6 px-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
        <AdventureMode nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
      </div>
    );
  }

  // If it's a practice placeholder
  if (['reading', 'listening', 'speaking', 'writing'].includes(node.type)) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-md p-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl mb-8"
        >
          {node.type === 'adventure' ? '🗺️' : '🚧'}
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-4 capitalize">
          Modul {node.type}
        </h2>
        <p className="text-slate-300 mb-12">
          {node.type === 'adventure' 
            ? 'Aici vei interacționa cu diverse personaje într-un joc captivant!'
            : 'Această lecție practică este în curs de dezvoltare.'}
        </p>
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-700 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
        >
          Simulează Completarea
        </button>
      </div>
    );
  }

  // Ensure items are loaded for review
  if (dynamicItems.length === 0) return null;

  const currentItem = dynamicItems[currentIndex];

  const handleCorrect = () => {
    if (currentIndex + 1 >= dynamicItems.length) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
      if ((currentIndex + 1) % 3 === 0) {
        showOtto('Te descurci excelent! Continuă așa!', 'happy', 2500);
      }
    }
  };

  const handleWrongWord = (word: Word) => {
    showOtto(`Fără grabă! Cuvântul "${word.german}" este de genul "${word.article}". Mai încearcă o dată.`, 'explaining');
  };

  const handleWrongPuzzle = () => {
    showOtto('Aproape! Amintește-ți că verbul trebuie să fie pe locul 2 în propoziție.', 'thinking');
  };

  // Type guard to determine which component to render
  const isWord = (item: Word | SentencePuzzleType): item is Word => {
    return 'german' in item;
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-6 px-4 pb-8">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-slate-400 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1 px-4">
          <ProgressTracker current={currentIndex} total={dynamicItems.length} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isWord(currentItem) ? (
          <GenderChallenge
            key={`word-${currentItem.id}`}
            word={currentItem}
            onCorrect={handleCorrect}
            onWrong={() => handleWrongWord(currentItem)}
          />
        ) : (
          <SentencePuzzle
            key={`puzzle-${currentItem.id}`}
            puzzle={currentItem}
            onCorrect={handleCorrect}
            onWrong={handleWrongPuzzle}
          />
        )}
      </div>
    </div>
  );
};
