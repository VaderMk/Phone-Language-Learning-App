import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import { playSuccessSound } from '../utils/audio';

export const DashboardWidgets: React.FC<{
  onSkinUnlock: (skin: 'golden' | 'party') => void;
}> = ({ onSkinUnlock }) => {
  // Shared Quest Logic
  const [questProgress, setQuestProgress] = useState(65); // Simulated starting progress
  const [questCompleted, setQuestCompleted] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Daily Flash Logic
  const [flashOpen, setFlashOpen] = useState(false);
  const [flashAnswered, setFlashAnswered] = useState(false);

  useEffect(() => {
    // Simulate community progress
    const interval = setInterval(() => {
      setQuestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setQuestCompleted(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 5); // Jump 0-4%
      });
    }, 4000); // Update every 4 seconds for MVP simulation

    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    hapticSuccess();
    playSuccessSound();
    setClaimed(true);
    onSkinUnlock('golden');
  };

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
      {/* Shared Quest Widget */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shadow-lg">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1">
              <span>🌍</span> Misiune Comunitară
            </h3>
            <p className="text-xs text-slate-400">10,000 lecții de germană finalizate</p>
          </div>
          <div className="text-xs font-bold text-indigo-400">{Math.min(questProgress, 100)}%</div>
        </div>
        
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(questProgress, 100)}%` }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          />
          {questCompleted && !claimed && (
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </div>

        <AnimatePresence>
          {questCompleted && !claimed && (
            <motion.button
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              onClick={handleClaim}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            >
              Deblochează Otto Auriu! ✨
            </motion.button>
          )}
        </AnimatePresence>
      </div>

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
