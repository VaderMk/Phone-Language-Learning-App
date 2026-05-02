import { useState, useEffect } from 'react';
import { type LessonNode } from './data/path';
import { LearningPath } from './components/LearningPath';
import { LessonRunner } from './components/LessonRunner';
import { OttoCoach, type OttoState } from './components/OttoCoach';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

function App() {
  const [activeNode, setActiveNode] = useState<LessonNode | null>(null);
  
  const [completedNodes, setCompletedNodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('languageApp_completedNodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [ottoState, setOttoState] = useState<OttoState>({ message: '', type: 'neutral', isVisible: false });

  useEffect(() => {
    localStorage.setItem('languageApp_completedNodes', JSON.stringify(completedNodes));
  }, [completedNodes]);

  const showOtto = (message: string, type: OttoState['type'] = 'explaining', duration = 4000) => {
    setOttoState({ message, type, isVisible: true });
    setTimeout(() => {
      setOttoState(prev => ({ ...prev, isVisible: false }));
    }, duration);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#818cf8', '#34d399', '#fbbf24', '#f87171']
    });
  };

  const handleLessonComplete = () => {
    if (activeNode && !completedNodes.includes(activeNode.id)) {
      setCompletedNodes(prev => [...prev, activeNode.id]);
    }
    
    triggerConfetti();
    showOtto('Ai terminat cu succes! Fără grabă, progresul tău e minunat.', 'happy', 4000);
    setActiveNode(null); // Return to map
  };

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center relative overflow-hidden font-sans">
      <OttoCoach state={ottoState} />

      {/* Decorative ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {!activeNode ? (
          <motion.div
            key="path-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full h-full flex flex-col"
          >
            {/* Header */}
            <div className="w-full bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 p-6 flex justify-between items-center z-10 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-xl">🇩🇪</div>
                <h1 className="text-xl font-black text-white tracking-wide">DerDieDas</h1>
              </div>
              <div className="bg-slate-700/50 px-4 py-2 rounded-full font-bold text-amber-400 flex items-center gap-2">
                <span>⭐</span> {completedNodes.length}
              </div>
            </div>

            <LearningPath
              completedNodes={completedNodes}
              onSelectNode={(node) => setActiveNode(node)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="lesson-view"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full h-full flex flex-col bg-slate-900 z-20"
          >
            <LessonRunner
              node={activeNode}
              onComplete={handleLessonComplete}
              onBack={() => setActiveNode(null)}
              showOtto={showOtto}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
