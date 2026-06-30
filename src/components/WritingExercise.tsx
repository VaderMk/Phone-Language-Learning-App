import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWritingItems } from '../data/practice';
import { speakGerman } from '../utils/tts';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import { hapticSuccess, hapticError } from '../utils/haptics';

interface WritingExerciseProps {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

const normalize = (s: string): string =>
  s.toLowerCase().trim().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');

export const WritingExercise: React.FC<WritingExerciseProps> = ({ nodeId, onComplete, showOtto }) => {
  const [items] = useState(() => getWritingItems(nodeId));
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const item = items[index];
  const isLast = index === items.length - 1;

  if (!item) {
    onComplete();
    return null;
  }

  const accepted = (item.accepted ?? [item.answer]).map(normalize);

  const handleCheck = () => {
    if (status === 'correct') return;
    const isCorrect = accepted.includes(normalize(value));
    if (isCorrect) {
      setStatus('correct');
      playSuccessSound();
      hapticSuccess();
      speakGerman(item.answer);
    } else {
      setStatus('wrong');
      playErrorSound();
      hapticError();
      showOtto(`Răspunsul corect era „${item.answer}". Nu uita articolul!`, 'explaining');
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex((p) => p + 1);
      setValue('');
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-2 px-1">
      <p className="text-sm text-slate-400 mb-6 text-center">
        {index + 1} / {items.length}
      </p>

      <div className="bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-700 shadow-xl text-center">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">✍️ Scrie în germană</span>
        <h2 className="text-2xl font-black text-white mt-3 capitalize">{item.prompt}</h2>
        <p className="text-xs text-slate-500 mt-2">Include articolul (der / die / das) acolo unde e cazul.</p>
      </div>

      <input
        type="text"
        value={value}
        autoFocus
        onChange={(e) => {
          setValue(e.target.value);
          if (status === 'wrong') setStatus('idle');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (status === 'correct' ? handleNext() : handleCheck());
        }}
        placeholder="ex: das Haus"
        disabled={status === 'correct'}
        className={`w-full bg-slate-900 border-2 rounded-2xl px-5 py-4 text-white text-lg text-center focus:outline-none transition-colors ${
          status === 'correct'
            ? 'border-emerald-500'
            : status === 'wrong'
            ? 'border-rose-500'
            : 'border-slate-700 focus:border-indigo-500'
        }`}
      />

      <AnimatePresence>
        {status === 'wrong' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-rose-400 text-sm text-center mt-3"
          >
            Răspuns corect: <span className="font-bold">{item.answer}</span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex-1" />

      {status === 'correct' ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full py-4 my-4 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
        >
          {isLast ? 'Finalizează' : 'Continuă'}
        </motion.button>
      ) : (
        <button
          onClick={handleCheck}
          disabled={!value.trim()}
          className="w-full py-4 my-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white border-b-4 border-indigo-800 disabled:border-slate-800 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
        >
          Verifică
        </button>
      )}
    </div>
  );
};
