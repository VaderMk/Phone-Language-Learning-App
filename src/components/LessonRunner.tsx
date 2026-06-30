import React, { useState, useEffect } from 'react';
import { type LessonNode } from '../data/path';
import { type Word, type SentencePuzzle as SentencePuzzleType, allLessonWords, puzzles } from '../data/words';
import { GenderChallenge } from './GenderChallenge';
import { SentencePuzzle } from './SentencePuzzle';
import { ProgressTracker } from './ProgressTracker';
import { AdventureMode } from './AdventureMode';
import { VisionQuest } from './VisionQuest';
import { ReadingExercise } from './ReadingExercise';
import { ListeningExercise } from './ListeningExercise';
import { SpeakingExercise } from './SpeakingExercise';
import { WritingExercise } from './WritingExercise';
import { ConjugationExercise } from './ConjugationExercise';
import { DeclensionExercise } from './DeclensionExercise';
import { FlashcardExercise } from './FlashcardExercise';
import { motion } from 'framer-motion';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface LessonRunnerProps {
  node: LessonNode;
  onComplete: () => void;
  onBack: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({ node, onComplete, onBack, showOtto }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dynamicItems, setDynamicItems] = useState<(Word | SentencePuzzleType)[]>(node.items);
  const [isLessonFinished, setIsLessonFinished] = useState(false);

  useEffect(() => {
    if (node.type === 'review') {
      // Generate dynamic review items based on SRS
      import('../utils/srs').then(({ getWeakWords }) => {
        const weakEntries = getWeakWords();
        // Map weak entries back to Word objects
        const weakWords = weakEntries
          .map(entry => allLessonWords.find(w => w.id === entry.wordId))
          .filter((w): w is Word => w !== undefined);

        // If we don't have enough weak words, fill with random ones
        const needed = Math.max(0, 5 - weakWords.length);
        const randomWords = [...allLessonWords]
          .filter(w => !weakWords.find(ww => ww.id === w.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, needed);
          
        const selectedWords = [...weakWords, ...randomWords].slice(0, 5);
        const shuffledPuzzles = [...puzzles].sort(() => Math.random() - 0.5).slice(0, 2);
        const mixed = [...selectedWords, ...shuffledPuzzles].sort(() => Math.random() - 0.5);
        setDynamicItems(mixed);
      });
    } else if (node.type === 'placeholder' && node.items.length === 0) {
      // Placeholder lessons (e.g. "Lecția 1", "Gramatică") had no content and
      // rendered a blank screen — fill them with real vocabulary to learn.
      import('../data/practice').then(({ getLessonWords }) => {
        setDynamicItems(getLessonWords(node.id));
      });
    } else {
      setDynamicItems(node.items);
    }
  }, [node]);

  // If it's a chest or trophy, just show a claim screen or Vision Quest
  if (node.type === 'chest' || node.type === 'trophy') {
    const genders = ['Masculin (der)', 'Feminin (die)', 'Neutru (das)'];
    const targetGender = genders[Math.floor(Math.random() * genders.length)];
    const isTrophy = node.type === 'trophy';

    return (
      <VisionQuest 
        objectiveWord={targetGender}
        objectiveTranslation={`obiect ${isTrophy ? 'pentru trofeu' : 'în viața reală'} care să fie de genul`}
        onComplete={onComplete}
        onBack={onBack}
        showOtto={showOtto}
      />
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

  // Functional practice exercises: reading / listening / speaking / writing
  // plus the grammar lesson types: conjugation / declension / flashcard
  if (['reading', 'listening', 'speaking', 'writing', 'conjugation', 'declension', 'flashcard'].includes(node.type)) {
    const labels: Record<string, string> = {
      reading: 'Citire',
      listening: 'Ascultare',
      speaking: 'Vorbire',
      writing: 'Scriere',
      conjugation: 'Conjugare',
      declension: 'Declinare',
      flashcard: 'Cuvinte noi',
    };
    return (
      <div className="flex flex-col w-full h-full max-w-md mx-auto pt-6 px-4 pb-6">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="flex-1 text-center text-lg font-bold text-white pr-8">{labels[node.type]}</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
          {node.type === 'reading' && (
            <ReadingExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
          {node.type === 'listening' && (
            <ListeningExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
          {node.type === 'speaking' && (
            <SpeakingExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
          {node.type === 'writing' && (
            <WritingExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
          {node.type === 'conjugation' && (
            <ConjugationExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
          {node.type === 'declension' && (
            <DeclensionExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
          {node.type === 'flashcard' && (
            <FlashcardExercise nodeId={node.id} onComplete={onComplete} showOtto={showOtto} />
          )}
        </div>
      </div>
    );
  }

  // Ensure items are loaded for review
  if (dynamicItems.length === 0) return null;

  const currentItem = dynamicItems[currentIndex];

  const unitMatch = node.id.match(/^u(\d+)_/);
  const unitNum = unitMatch ? parseInt(unitMatch[1], 10) : 1;
  const isSpeechMandatory = unitNum >= 6;

  const handleCorrect = () => {
    if (currentIndex + 1 >= dynamicItems.length) {
      setIsLessonFinished(true);
      playSuccessSound();
      showOtto('Lecție completă! Ai reținut foarte bine noțiunile.', 'happy', 4000);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#34d399', '#fbbf24', '#f87171']
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      if ((currentIndex + 1) % 3 === 0) {
        showOtto('Te descurci excelent! Continuă așa!', 'happy', 2500);
      }
      playSuccessSound();
    }
  };

  const handleWrongWord = (word: Word) => {
    playErrorSound();
    showOtto(`Fără grabă! Cuvântul "${word.german}" este de genul "${word.article}". Mai încearcă o dată.`, 'explaining');
  };

  const handleWrongPuzzle = () => {
    playErrorSound();
    showOtto('Aproape! Amintește-ți că verbul trebuie să fie pe locul 2 în propoziție.', 'thinking');
  };

  // Type guard to determine which component to render
  const isWord = (item: Word | SentencePuzzleType): item is Word => {
    return 'german' in item;
  };

  if (isLessonFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full w-full max-w-md p-6 text-center z-10 mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl mb-8">
          🎉
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-4">Lecție Completă!</h2>
        <p className="text-slate-300 mb-12">Excelent! Ai parcurs toate exercițiile din această sesiune.</p>
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-700 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
        >
          Continuă
        </button>
      </div>
    );
  }

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
            isSpeechMandatory={isSpeechMandatory}
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
