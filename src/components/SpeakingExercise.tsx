import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpeakingItems } from '../data/practice';
import { speakGerman } from '../utils/tts';
import { isSpeechRecognitionSupported, type SpeechResult } from '../utils/speech';
import { SpeechButton } from './SpeechButton';
import { playSuccessSound } from '../utils/audio';
import { hapticSuccess } from '../utils/haptics';

interface SpeakingExerciseProps {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const SpeakingExercise: React.FC<SpeakingExerciseProps> = ({ nodeId, onComplete, showOtto }) => {
  const [items] = useState(() => getSpeakingItems(nodeId));
  const [index, setIndex] = useState(0);
  const [passed, setPassed] = useState(false);
  const supported = isSpeechRecognitionSupported();

  const item = items[index];
  const isLast = index === items.length - 1;

  // Demonstrate the correct pronunciation on each new prompt.
  useEffect(() => {
    if (!item) return;
    const t = setTimeout(() => speakGerman(item.german), 400);
    return () => clearTimeout(t);
  }, [item]);

  if (!item) {
    onComplete();
    return null;
  }

  const handleResult = (result: SpeechResult) => {
    if (result.isMatch) {
      setPassed(true);
      playSuccessSound();
      hapticSuccess();
      showOtto('Pronunție excelentă! 🎙️', 'happy', 2000);
    } else if (result.transcript) {
      showOtto(`Aproape! Încearcă din nou: „${item.german}"`, 'explaining');
    } else {
      showOtto('Nu te-am auzit bine. Mai apasă pe microfon și vorbește clar.', 'thinking');
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex((p) => p + 1);
      setPassed(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-2 px-1">
      <p className="text-sm text-slate-400 mb-6 text-center">
        {index + 1} / {items.length}
      </p>

      {/* Phrase to pronounce */}
      <div className="bg-slate-800 rounded-3xl p-6 mb-4 border border-slate-700 shadow-xl text-center relative">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">🎙️ Spune cu voce tare</span>
        <h2 className="text-3xl font-black text-white mt-3 mb-2 capitalize">{item.german}</h2>
        <p className="text-slate-400">{item.translation}</p>
        <button
          onClick={() => speakGerman(item.german)}
          className="absolute top-4 right-5 text-slate-400 hover:text-white p-1"
          title="Ascultă modelul"
        >
          🔊
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {supported ? (
          <SpeechButton expectedText={item.german} onResult={handleResult} />
        ) : (
          <p className="text-center text-slate-400 text-sm max-w-[260px]">
            Browserul tău nu suportă recunoașterea vocală. Rostește fraza cu voce tare,
            apoi apasă „Am rostit-o".
          </p>
        )}
      </div>

      <AnimatePresence>
        {(passed || !supported) && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className={`w-full py-4 my-4 rounded-2xl text-lg font-bold text-white border-b-4 active:translate-y-1 active:border-b-0 transition-all shadow-xl ${
              passed
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800'
            }`}
          >
            {!supported ? (isLast ? 'Am rostit-o · Finalizează' : 'Am rostit-o') : isLast ? 'Finalizează' : 'Continuă'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
