import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getConjugationItems, type ConjugationItem } from '../data/grammar-practice';
import { speakGerman } from '../utils/tts';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import { hapticSuccess, hapticError } from '../utils/haptics';
import { PracticeLoader } from './PracticeLoader';

interface Props {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const ConjugationExercise: React.FC<Props> = ({ nodeId, onComplete, showOtto }) => {
  const [items, setItems] = useState<ConjugationItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    let active = true;
    getConjugationItems(nodeId).then((data) => active && setItems(data));
    return () => {
      active = false;
    };
  }, [nodeId]);

  if (!items) return <PracticeLoader />;
  if (items.length === 0) return <PracticeLoader error onSkip={onComplete} />;

  const item = items[index];
  const isLast = index === items.length - 1;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === item.correct) {
      playSuccessSound();
      hapticSuccess();
      speakGerman(`${item.pronoun.split('/')[0]} ${item.answer}`);
    } else {
      playErrorSound();
      hapticError();
      showOtto(`Forma corectă: „${item.pronoun} ${item.answer}".`, 'explaining');
    }
  };

  const handleNext = () => {
    if (isLast) return onComplete();
    setIndex((p) => p + 1);
    setSelected(null);
    setAnswered(false);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-2 px-1">
      <p className="text-sm text-slate-400 mb-4 text-center">
        {index + 1} / {items.length}
      </p>

      <div className="bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-700 shadow-xl text-center">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">🔀 {item.tenseLabel}</span>
        <h2 className="text-2xl font-black text-white mt-3">
          {item.infinitive}
          <span className="text-base font-medium text-slate-400"> — {item.translation}</span>
        </h2>
        <p className="text-lg text-slate-200 mt-4">
          <span className="font-bold text-amber-300">{item.pronoun}</span> ___
        </p>
      </div>

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
              className={`w-full py-4 px-5 rounded-2xl border-b-4 active:translate-y-1 active:border-b-0 transition-all text-center font-semibold ${style}`}
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
