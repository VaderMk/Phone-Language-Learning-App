import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReadingExercise, getRichReadingExercise, type ReadingExercise as ReadingData } from '../data/practice';
import { speakGerman } from '../utils/tts';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import { hapticSuccess, hapticError } from '../utils/haptics';

interface ReadingExerciseProps {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const ReadingExercise: React.FC<ReadingExerciseProps> = ({ nodeId, onComplete, showOtto }) => {
  // Start with the synchronous version; upgrade to the dictionary-enriched
  // passage once it loads, so there's never a blank loading screen.
  const [exercise, setExercise] = useState<ReadingData>(() => getReadingExercise(nodeId));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    let active = true;
    getRichReadingExercise(nodeId).then((rich) => {
      if (active) setExercise(rich);
    });
    return () => {
      active = false;
    };
  }, [nodeId]);

  const question = exercise.questions[questionIndex];
  const isLast = questionIndex === exercise.questions.length - 1;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === question.correct) {
      playSuccessSound();
      hapticSuccess();
    } else {
      playErrorSound();
      hapticError();
      showOtto('Recitește textul cu atenție — răspunsul e acolo!', 'explaining');
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setQuestionIndex((p) => p + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-2 px-1">
      {/* Text passage */}
      <div className="bg-slate-800 rounded-3xl p-5 mb-6 border border-slate-700 shadow-xl relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">📖 Citește textul</span>
          <button
            onClick={() => speakGerman(exercise.text)}
            className="text-slate-400 hover:text-white p-1"
            title="Ascultă textul"
          >
            🔊
          </button>
        </div>
        <p className="text-lg text-white leading-relaxed font-medium">{exercise.text}</p>
      </div>

      {/* Question */}
      <div className="flex-1">
        <p className="text-sm text-slate-400 mb-1">
          Întrebarea {questionIndex + 1} din {exercise.questions.length}
        </p>
        <h3 className="text-xl font-bold text-white mb-5">{question.question}</h3>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correct;
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
                className={`w-full py-4 px-5 rounded-2xl border-b-4 active:translate-y-1 active:border-b-0 transition-all text-left font-semibold ${style}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Continue */}
      <AnimatePresence>
        {answered && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 my-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:translate-y-1 active:border-b-0 transition-all shadow-xl"
          >
            {isLast ? 'Finalizează' : 'Următoarea întrebare'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
