import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getListeningItems } from '../data/practice';
import { speakGerman } from '../utils/tts';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import { hapticSuccess, hapticError, hapticTap } from '../utils/haptics';

interface ListeningExerciseProps {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const ListeningExercise: React.FC<ListeningExerciseProps> = ({ nodeId, onComplete, showOtto }) => {
  const [items] = useState(() => getListeningItems(nodeId));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const item = items[index];
  const isLast = index === items.length - 1;

  // Auto-play the audio when a new item appears.
  useEffect(() => {
    if (!item) return;
    const t = setTimeout(() => speakGerman(item.audio), 400);
    return () => clearTimeout(t);
  }, [item]);

  if (!item) {
    onComplete();
    return null;
  }

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === item.correct) {
      playSuccessSound();
      hapticSuccess();
    } else {
      playErrorSound();
      hapticError();
      showOtto(`Era „${item.audio}". Ascultă din nou cu atenție!`, 'explaining');
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex((p) => p + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-2 px-1">
      <p className="text-sm text-slate-400 mb-4 text-center">
        {index + 1} / {items.length}
      </p>

      {/* Big speaker button */}
      <div className="flex flex-col items-center justify-center mb-8">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticTap();
            speakGerman(item.audio);
          }}
          className="w-28 h-28 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:bg-indigo-500/30 transition-colors"
        >
          🔊
        </motion.button>
        <button
          onClick={() => speakGerman(item.audio)}
          className="mt-4 text-sm text-indigo-300 font-medium underline-offset-2 hover:underline"
        >
          🐢 Ascultă din nou
        </button>
      </div>

      <h3 className="text-lg font-bold text-white mb-5 text-center">{item.prompt}</h3>

      <div className="flex flex-col gap-3 flex-1">
        {item.options.map((opt, i) => {
          const isCorrect = i === item.correct;
          const isPicked = i === selected;
          let style = 'bg-slate-700 hover:bg-slate-600 border-slate-900 text-white';
          if (answered && isCorrect) style = 'bg-emerald-600 border-emerald-800 text-white';
          else if (answered && isPicked && !isCorrect) style = 'bg-rose-600 border-rose-800 text-white';
          else if (answered) style = 'bg-slate-700 border-slate-900 text-slate-400 opacity-60';

          return (
            <motion.button
              key={i}
              whileTap={answered ? {} : { scale: 0.97 }}
              onClick={() => handleSelect(i)}
              className={`w-full py-4 px-5 rounded-2xl border-b-4 active:translate-y-1 active:border-b-0 transition-all text-center font-semibold capitalize ${style}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 my-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
          >
            {isLast ? 'Finalizează' : 'Continuă'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
