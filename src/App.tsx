import { useState, useEffect } from 'react';
import { type LessonNode } from './data/path';
import { LearningPath } from './components/LearningPath';
import { LessonRunner } from './components/LessonRunner';
import { OttoCoach, type OttoState } from './components/OttoCoach';
import { OttoChat } from './components/OttoChat';
import { DashboardWidgets } from './components/DashboardWidgets';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateSyncCode, loadProgressFromCloud, saveProgressToCloud } from './utils/sync';

function App() {
  const [activeNode, setActiveNode] = useState<LessonNode | null>(null);
  
  const [completedNodes, setCompletedNodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('languageApp_completedNodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [syncCode, setSyncCode] = useState<string>(() => {
    const saved = localStorage.getItem('languageApp_syncCode');
    if (saved) return saved;
    const newCode = generateSyncCode();
    localStorage.setItem('languageApp_syncCode', newCode);
    return newCode;
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInterest, setUserInterest] = useState(() => localStorage.getItem('userInterest') || '');
  const [importCode, setImportCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [ottoState, setOttoState] = useState<OttoState>({ message: '', type: 'neutral', isVisible: false });

  // Save to local and cloud whenever progress changes
  useEffect(() => {
    localStorage.setItem('languageApp_completedNodes', JSON.stringify(completedNodes));
    
    // Attempt cloud sync in background
    if (completedNodes.length > 0) {
      saveProgressToCloud(syncCode, completedNodes);
    }
  }, [completedNodes, syncCode]);

  const showOtto = (message: string, type: 'neutral' | 'happy' | 'sad' | 'explaining' | 'thinking' = 'explaining', duration = 3000) => {
    setOttoState({ message, type, isVisible: true, skin: 'default' });
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

  const handleImportSync = async () => {
    const code = importCode.trim().toUpperCase();
    if (!code) return;
    
    setIsSyncing(true);
    const cloudProgress = await loadProgressFromCloud(code);
    setIsSyncing(false);

    if (cloudProgress) {
      setCompletedNodes(cloudProgress);
      setSyncCode(code);
      localStorage.setItem('languageApp_syncCode', code);
      setIsSyncModalOpen(false);
      showOtto('Progres sincronizat cu succes! Bine ai revenit.', 'happy', 4000);
    } else {
      showOtto('Nu am găsit progres pentru acest cod, sau lipsește configurarea bazei de date.', 'sad', 5000);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex justify-center items-center relative overflow-hidden font-sans">
      <div className="w-full max-w-md h-full bg-slate-900 relative flex flex-col shadow-2xl overflow-hidden border-x border-slate-800">
        <OttoCoach state={ottoState} />

        {/* Decorative ambient lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

        <AnimatePresence>
          {!activeNode ? (
            <motion.div
              key="path-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex flex-col"
            >
            {/* Header */}
            <div className="w-full bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 p-6 flex justify-between items-center z-10 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-xl">🇩🇪</div>
                <h1 className="text-xl font-black text-white tracking-wide">DerDieDas</h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white"
                >
                  👤
                </button>
                <button 
                  onClick={() => setIsSyncModalOpen(true)}
                  className="bg-slate-700/50 hover:bg-slate-600 transition p-2 rounded-full text-xl"
                  title="Cloud Sync"
                >
                  ☁️
                </button>
                <div className="bg-slate-700/50 px-4 py-2 rounded-full font-bold text-amber-400 flex items-center gap-2">
                  <span>⭐</span> {completedNodes.length}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full pb-20 relative scroll-smooth hide-scrollbar">
            
              <DashboardWidgets />

              {userInterest && (
                <div className="mx-4 mt-2 mb-4 p-4 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 text-center">
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Calea Personalizată</p>
                  <p className="text-sm text-slate-200">Următoarele lecții vor include termeni despre: <span className="font-bold text-white">{userInterest}</span></p>
                </div>
              )}

              <LearningPath
                completedNodes={completedNodes}
                onSelectNode={(node) => setActiveNode(node)}
                onLockedClick={() => showOtto('Ești aproape! Termină testul de recapitulare anterior ca să mergem mai departe!', 'explaining')}
              />
            </div>

            {/* Floating Chat Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center text-3xl z-30 border-2 border-indigo-400"
            >
              💬
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="lesson-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
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

      {/* Sync Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Profil & Interese</h2>
              <p className="text-sm text-slate-400 mb-6">
                Spune-ne ce te pasionează (ex: Gătit, Mașini, Călătorii), iar Gemini va personaliza lecțiile tale viitoare!
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interes Principal</label>
                  <input
                    type="text"
                    value={userInterest}
                    onChange={(e) => {
                      setUserInterest(e.target.value);
                      localStorage.setItem('userInterest', e.target.value);
                    }}
                    placeholder="ex: Gătit..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Salvează
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isSyncModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-700 relative"
            >
              <button 
                onClick={() => setIsSyncModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                ☁️ Cloud Sync
              </h2>
              
              <div className="bg-slate-900/50 p-4 rounded-2xl mb-6 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Codul tău de sincronizare curent:</p>
                <div className="text-3xl font-mono font-bold text-indigo-400 tracking-widest text-center">
                  {syncCode}
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Folosește acest cod pe alt dispozitiv pentru a-ți relua progresul.
                </p>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <p className="text-sm text-slate-400 mb-3">Ai deja un cod pe alt device? Importă-l aici:</p>
                <input 
                  type="text" 
                  placeholder="EX: A1B2C3"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-center text-lg mb-4 focus:outline-none focus:border-indigo-500 uppercase tracking-widest"
                  maxLength={6}
                />
                <button
                  onClick={handleImportSync}
                  disabled={importCode.length < 6 || isSyncing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
                >
                  {isSyncing ? 'Se caută...' : 'Descarcă Progres'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && <OttoChat onClose={() => setIsChatOpen(false)} userInterest={userInterest} completedNodes={completedNodes} />}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
