import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Word, type Article } from '../data/words';
import clsx from 'clsx';
import { speakGerman } from '../utils/tts';
import { recordCorrect, recordError } from '../utils/srs';
import { hapticSuccess, hapticError, hapticTap } from '../utils/haptics';
import { SpeechButton } from './SpeechButton';
import { type SpeechResult } from '../utils/speech';

interface GenderChallengeProps {
  word: Word;
  onCorrect: () => void;
  onWrong: (word: Word) => void;
}

export const GenderChallenge: React.FC<GenderChallengeProps> = ({ word, onCorrect, onWrong }) => {
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const [canTalk, setCanTalk] = useState(true);

  useEffect(() => {
    setStatus('idle');
  }, [word]);

  const handleGuess = (article: Article) => {
    if (status !== 'idle') return;

    hapticTap();
    // Speak the combination the user just selected
    if (canTalk) {
      speakGerman(`${article} ${word.german}`);
    }

    if (article === word.article) {
      setStatus('correct');
      recordCorrect(word.id, word.german);
      hapticSuccess();
      setTimeout(() => {
        onCorrect();
      }, 1200); // Wait for audio and bounce animation
    } else {
      setStatus('wrong');
      recordError(word.id, word.german);
      hapticError();
      onWrong(word);
      setTimeout(() => {
        setStatus('idle');
      }, 600); // Wait for shake animation
    }
  };

  const handleSpeechResult = useCallback((result: SpeechResult) => {
    if (status !== 'idle' || !canTalk) return;
    if (!result.transcript) return;

    const spoken = result.transcript.toLowerCase().trim();

    // Check if user said the correct article + word combo
    if (result.isMatch) {
      setStatus('correct');
      recordCorrect(word.id, word.german);
      hapticSuccess();
      speakGerman(`${word.article} ${word.german}`);
      setTimeout(() => onCorrect(), 1200);
      return;
    }

    // Check if user said just the article
    const articles: Article[] = ['der', 'die', 'das'];
    for (const art of articles) {
      if (spoken.startsWith(art)) {
        handleGuess(art);
        return;
      }
    }

    // No recognizable article found
    hapticError();
    recordError(word.id, word.german);
    onWrong(word);
  }, [status, word, onCorrect, onWrong, canTalk]);

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
          className="w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center relative"
        >
          <span className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">{word.translation}</span>
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-5xl font-extrabold text-white tracking-tight">{word.german}</h2>
            {canTalk && (
              <button 
                onClick={(e) => { e.stopPropagation(); speakGerman(word.german); }}
                className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-full text-2xl transition-colors active:scale-95"
                title="Ascultă pronunția"
              >
                🔊
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium">{word.gender}</span>

          {/* Speech recognition mic — say "der/die/das Wort" */}
          {canTalk && (
            <div className="mt-5">
              <SpeechButton
                expectedText={`${word.article} ${word.german}`}
                onResult={handleSpeechResult}
                compact
              />
            </div>
          )}

          <button 
            onClick={() => setCanTalk(!canTalk)}
            className="absolute top-4 right-4 text-xs text-slate-500 hover:text-slate-300 flex flex-col items-center gap-1"
          >
            <span className="text-lg">{canTalk ? '🤫' : '🗣️'}</span>
            <span>{canTalk ? 'Nu pot vorbi' : 'Pot vorbi'}</span>
          </button>
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
