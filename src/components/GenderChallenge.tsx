import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Word, type Article } from '../data/words';
import clsx from 'clsx';

interface GenderChallengeProps {
  word: Word;
  onCorrect: () => void;
  onWrong: (word: Word) => void;
}

export const GenderChallenge: React.FC<GenderChallengeProps> = ({ word, onCorrect, onWrong }) => {
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');

  useEffect(() => {
    setStatus('idle');
  }, [word]);

  const handleGuess = (article: Article) => {
    if (status !== 'idle') return;

    if (article === word.article) {
      setStatus('correct');
      setTimeout(() => {
        onCorrect();
      }, 800); // Wait for bounce animation
    } else {
      setStatus('wrong');
      onWrong(word);
      setTimeout(() => {
        setStatus('idle');
      }, 600); // Wait for shake animation
    }
  };

  const variants = {
    idle: { x: 0, scale: 1 },
    wrong: { 
      x: [-10, 10, -10, 10, 0], 
      transition: { duration: 0.4 } 
    },
    correct: { 
      scale: [1, 1.1, 1], 
      y: [0, -10, 0],
      transition: { duration: 0.5 } 
    }
  };

  return (
    <motion.div 
      variants={variants}
      animate={status}
      className="flex flex-col items-center w-full max-w-sm mx-auto"
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center"
        >
          <span className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">{word.translation}</span>
          <h2 className="text-5xl font-extrabold text-white mb-2 tracking-tight">{word.german}</h2>
          <span className="text-xs text-slate-500 font-medium">{word.gender}</span>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 w-full">
        <button
          onClick={() => handleGuess('der')}
          className={clsx(
            "w-full py-5 rounded-2xl text-2xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center",
            "bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800"
          )}
        >
          DER
        </button>
        <button
          onClick={() => handleGuess('die')}
          className={clsx(
            "w-full py-5 rounded-2xl text-2xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center",
            "bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800"
          )}
        >
          DIE
        </button>
        <button
          onClick={() => handleGuess('das')}
          className={clsx(
            "w-full py-5 rounded-2xl text-2xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center",
            "bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800"
          )}
        >
          DAS
        </button>
      </div>
    </motion.div>
  );
};
