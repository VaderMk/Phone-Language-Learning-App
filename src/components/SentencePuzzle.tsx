import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type SentencePuzzle as SentencePuzzleType, type PuzzleWord } from '../data/words';
import clsx from 'clsx';
import { speakGerman } from '../utils/tts';

interface SentencePuzzleProps {
  puzzle: SentencePuzzleType;
  onCorrect: () => void;
  onWrong: () => void;
}

export const SentencePuzzle: React.FC<SentencePuzzleProps> = ({ puzzle, onCorrect, onWrong }) => {
  const [availableWords, setAvailableWords] = useState<PuzzleWord[]>([]);
  const [selectedWords, setSelectedWords] = useState<PuzzleWord[]>([]);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');

  // Scramble words initially
  useEffect(() => {
    const shuffled = [...puzzle.parts].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setStatus('idle');
  }, [puzzle]);

  const handleSelectWord = (word: PuzzleWord) => {
    if (status !== 'idle') return;
    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id));
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);

    // If all words are selected, validate the sentence
    if (newSelected.length === puzzle.parts.length) {
      validateSentence(newSelected);
    }
  };

  const handleDeselectWord = (word: PuzzleWord) => {
    if (status !== 'idle') return;
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
    setAvailableWords((prev) => [...prev, word]);
  };

  const validateSentence = (words: PuzzleWord[]) => {
    // V2 rule: Verb must be in the 2nd position (index 1)
    if (words[1].category === 'verb') {
      setStatus('correct');
      speakGerman(words.map(w => w.text).join(' '));
      setTimeout(() => {
        onCorrect();
      }, 1500); // Give enough time to hear the sentence
    } else {
      setStatus('wrong');
      onWrong();
      setTimeout(() => {
        // Reset after shake
        setStatus('idle');
        const shuffled = [...puzzle.parts].sort(() => Math.random() - 0.5);
        setAvailableWords(shuffled);
        setSelectedWords([]);
      }, 1500);
    }
  };

  const variants = {
    idle: { x: 0 },
    wrong: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    },
    correct: {
      scale: [1, 1.05, 1],
      y: [0, -10, 0],
      transition: { duration: 0.5 }
    }
  };

  const getWordColorClass = (word: PuzzleWord) => {
    if (word.category === 'noun' && word.article) {
      if (word.article === 'der') return 'text-blue-400 border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      if (word.article === 'die') return 'text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      if (word.article === 'das') return 'text-green-400 border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    }
    return 'text-slate-200 border-slate-600 bg-slate-700/50';
  };

  return (
    <motion.div
      variants={variants}
      animate={status}
      className="flex flex-col items-center w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-6">
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{puzzle.translation}</span>
      </div>

      {/* Selected Slots */}
      <div className="w-full flex flex-wrap justify-center gap-2 mb-8 min-h-[60px] p-4 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-inner">
        <AnimatePresence>
          {selectedWords.map((word) => (
            <motion.button
              key={`sel-${word.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => handleDeselectWord(word)}
              className={clsx(
                "px-4 py-2 rounded-xl text-lg font-bold border-2 transition-transform active:scale-95",
                getWordColorClass(word)
              )}
            >
              {word.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {status === 'correct' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-green-400 font-bold mb-4 bg-green-500/10 py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Super!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Words */}
      <div className="flex flex-wrap justify-center gap-3 w-full">
        <AnimatePresence>
          {availableWords.map((word) => (
            <motion.button
              key={`avail-${word.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => handleSelectWord(word)}
              className={clsx(
                "px-5 py-3 rounded-xl text-xl font-bold border-2 shadow-lg transition-transform active:scale-95",
                getWordColorClass(word)
              )}
            >
              {word.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
