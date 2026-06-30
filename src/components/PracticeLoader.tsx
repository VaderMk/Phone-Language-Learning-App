import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  /** Show an error/empty state with a skip button instead of a spinner. */
  error?: boolean;
  onSkip?: () => void;
}

/** Shared loading / empty state for dictionary-backed practice exercises. */
export const PracticeLoader: React.FC<Props> = ({ error, onSkip }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
        <div className="text-6xl mb-6">📚</div>
        <p className="text-slate-300 mb-8">Nu am putut încărca conținutul acestei lecții.</p>
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-8 py-3 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:translate-y-1 active:border-b-0 transition-all"
          >
            Continuă
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-slate-700 border-t-indigo-400 rounded-full mb-6"
      />
      <p className="text-slate-400 text-sm">Se pregătește lecția…</p>
    </div>
  );
};
