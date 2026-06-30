import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlashcardItems, type FlashcardItem } from '../data/grammar-practice';
import { speakGerman } from '../utils/tts';
import { hapticTap } from '../utils/haptics';
import { PracticeLoader } from './PracticeLoader';

interface Props {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const FlashcardExercise: React.FC<Props> = ({ nodeId, onComplete }) => {
  const [items, setItems] = useState<FlashcardItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let active = true;
    getFlashcardItems(nodeId).then((data) => active && setItems(data));
    return () => {
      active = false;
    };
  }, [nodeId]);

  // Pronounce each new card automatically.
  useEffect(() => {
    if (items && items[index]) {
      const t = setTimeout(() => speakGerman(items[index].german), 350);
      return () => clearTimeout(t);
    }
  }, [items, index]);

  if (!items) return <PracticeLoader />;
  if (items.length === 0) return <PracticeLoader error onSkip={onComplete} />;

  const item = items[index];
  const isLast = index === items.length - 1;

  const handleNext = () => {
    if (isLast) return onComplete();
    setIndex((p) => p + 1);
    setRevealed(false);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-2 px-1">
      <p className="text-sm text-slate-400 mb-4 text-center">
        {index + 1} / {items.length}
      </p>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            hapticTap();
            setRevealed(true);
          }}
          className="w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl text-center cursor-pointer relative min-h-[260px] flex flex-col items-center justify-center"
        >
          <span className="absolute top-4 left-5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            🃏 {item.pos}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              speakGerman(item.german);
            }}
            className="absolute top-4 right-5 text-slate-400 hover:text-white p-1"
          >
            🔊
          </button>

          <h2 className="text-3xl font-black text-white">{item.german}</h2>
          {item.ipa && <p className="text-slate-500 mt-1">/{item.ipa}/</p>}

          <AnimatePresence>
            {revealed ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <p className="text-xl font-bold text-emerald-300">{item.translation}</p>
                <p className="text-slate-300 mt-4">{item.exampleDe}</p>
                {item.exampleRo && <p className="text-slate-500 text-sm mt-1 italic">{item.exampleRo}</p>}
              </motion.div>
            ) : (
              <p className="text-slate-500 text-sm mt-6">👆 Apasă pentru a vedea traducerea</p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <button
        onClick={revealed ? handleNext : () => setRevealed(true)}
        className="w-full py-4 my-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
      >
        {revealed ? (isLast ? 'Finalizează' : 'Următorul card') : 'Arată traducerea'}
      </button>
    </div>
  );
};
