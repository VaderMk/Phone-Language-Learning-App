import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import { playSuccessSound } from '../utils/audio';

export const DashboardWidgets: React.FC = () => {
  // Daily Flash Logic
  const [flashOpen, setFlashOpen] = useState(false);
  const [flashAnswered, setFlashAnswered] = useState(false);

  const handleFlashAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      hapticSuccess();
      playSuccessSound();
    } else {
      hapticTap();
    }
    setFlashAnswered(true);
    setTimeout(() => setFlashOpen(false), 2000);
  };

  return (
    <div className="w-full px-4 py-2 space-y-3">


      {/* Daily Flash Widget */}
      {!flashOpen && !flashAnswered && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-600 rounded-2xl p-4 flex justify-between items-center shadow-lg active:scale-95 transition-transform"
          onClick={() => {
            hapticTap();
            setFlashOpen(true);
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">⚡</span>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Flash</h3>
              <p className="text-xs text-indigo-200">5 secunde. Gata?</p>
            </div>
          </div>
          <button className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white">
            Începe
          </button>
        </motion.div>
      )}

      {/* Expanded Flash UI */}
      <AnimatePresence>
        {flashOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.9, height: 0 }}
            className="bg-slate-800 border border-indigo-500 rounded-2xl p-5 shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            <h3 className="text-sm font-bold text-indigo-400 mb-4 text-center tracking-widest uppercase">Cum se zice la:</h3>
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Masă</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleFlashAnswer(true)}
                className={`py-3 rounded-xl font-bold border-b-4 transition-colors ${
                  flashAnswered ? 'bg-emerald-500 border-emerald-700 text-white' : 'bg-slate-700 hover:bg-slate-600 border-slate-900 text-white'
                }`}
              >
                Tisch
              </button>
              <button 
                onClick={() => handleFlashAnswer(false)}
                className="py-3 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 rounded-xl font-bold text-white transition-colors"
              >
                Stuhl
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
