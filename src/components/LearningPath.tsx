import React from 'react';
import { learningPath, type LessonNode } from '../data/path';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface LearningPathProps {
  completedNodes: string[];
  onSelectNode: (node: LessonNode) => void;
  onLockedClick: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ completedNodes, onSelectNode, onLockedClick }) => {
  const getOffset = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return 'translate-x-0';
    if (cycle === 1) return '-translate-x-8';
    if (cycle === 2) return '-translate-x-12';
    if (cycle === 3) return '-translate-x-8';
    return 'translate-x-0';
  };

  const getBgColor = (type: LessonNode['type'], isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return 'bg-slate-700 border-slate-600 text-slate-500 shadow-none';
    if (isCompleted) return 'bg-amber-400 border-amber-500 text-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]';
    
    switch (type) {
      case 'word': return 'bg-indigo-500 border-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]';
      case 'sentence': return 'bg-rose-500 border-rose-600 text-white shadow-[0_0_20px_rgba(244,63,113,0.6)]';
      case 'reading': return 'bg-teal-500 border-teal-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.6)]';
      case 'listening': return 'bg-sky-500 border-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.6)]';
      case 'speaking': return 'bg-orange-500 border-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)]';
      case 'writing': return 'bg-pink-500 border-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]';
      case 'adventure': return 'bg-violet-500 border-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]';
      case 'conjugation': return 'bg-amber-500 border-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.6)]';
      case 'declension': return 'bg-cyan-500 border-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]';
      case 'flashcard': return 'bg-lime-500 border-lime-600 text-white shadow-[0_0_20px_rgba(132,204,22,0.6)]';
      case 'review': return 'bg-purple-500 border-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]';
      case 'chest': return 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]';
      case 'trophy': return 'bg-fuchsia-500 border-fuchsia-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.6)]';
      case 'placeholder': return 'bg-slate-600 border-slate-700 text-slate-400 shadow-none';
      default: return 'bg-indigo-500';
    }
  };

  const getIcon = (type: LessonNode['type'], isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return '🔒';
    if (isCompleted) return '⭐';
    switch (type) {
      case 'word': return '📝';
      case 'sentence': return '💬';
      case 'reading': return '📖';
      case 'listening': return '🎧';
      case 'speaking': return '🗣️';
      case 'writing': return '✍️';
      case 'adventure': return '🗺️';
      case 'conjugation': return '🔀';
      case 'declension': return '📐';
      case 'flashcard': return '🃏';
      case 'review': return '🔥';
      case 'chest': return '🎁';
      case 'trophy': return '🏆';
      case 'placeholder': return '⏳';
      default: return '📝';
    }
  };

  const [expandedSectionId, setExpandedSectionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Find the first active (unlocked but not fully completed) section
    const activeSec = learningPath.find(sec => {
      const isLocked = sec.unlockRequirement ? !completedNodes.includes(sec.unlockRequirement) : false;
      if (isLocked) return false;
      const allCompleted = sec.nodes.every(n => completedNodes.includes(n.id));
      return !allCompleted;
    });
    
    if (activeSec) {
      setExpandedSectionId(activeSec.id);
    } else {
      setExpandedSectionId(learningPath[0].id); // default to first if all locked/done
    }
  }, [completedNodes]);

  let allPreviousCompleted = true;

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 flex flex-col items-center custom-scrollbar overflow-y-auto overflow-x-hidden h-full pb-32">
      {learningPath.map((section) => {
        const isSectionLocked = section.unlockRequirement ? !completedNodes.includes(section.unlockRequirement) : false;
        const isExpanded = expandedSectionId === section.id;

        const renderedNodes = section.nodes.map((node, index) => {
          const isCompleted = completedNodes.includes(node.id);
          // A node is locked if its section is locked, or if previous nodes in unlocked sections aren't completed yet
          const isLocked = isSectionLocked || (!allPreviousCompleted && !isCompleted);

          if (!isCompleted) {
            allPreviousCompleted = false;
          }

          // Gating (allPreviousCompleted) is advanced for every node above so lock state
          // stays correct, but only the expanded section builds actual DOM/motion elements.
          // With 370 sections this avoids mounting ~2,600 buttons on every render.
          if (!isExpanded) return null;

          return (
            <div key={node.id} className={clsx("flex flex-col items-center", getOffset(index))}>
              <motion.button
                whileTap={isLocked ? {} : { scale: 0.9 }}
                whileHover={isLocked ? {} : { scale: 1.05 }}
                onClick={() => {
                  if (isLocked) {
                    onLockedClick();
                  } else if (node.type !== 'placeholder') {
                    onSelectNode(node);
                  }
                }}
                className={clsx(
                  "w-20 h-20 rounded-full flex items-center justify-center text-3xl border-b-8 transition-colors",
                  getBgColor(node.type, isCompleted, isLocked),
                  isLocked ? "cursor-not-allowed" : "cursor-pointer"
                )}
              >
                {getIcon(node.type, isCompleted, isLocked)}
              </motion.button>
              <span className="mt-3 font-bold text-slate-300 bg-slate-900/50 px-3 py-1 rounded-full text-sm shadow-md">
                {node.title}
              </span>
            </div>
          );
        });

        return (
          <div key={section.id} className={clsx("w-full flex flex-col items-center mb-4 transition-opacity duration-500", isSectionLocked ? "opacity-60" : "opacity-100")}>
            <button 
              onClick={() => {
                if (isSectionLocked) {
                  onLockedClick();
                } else {
                  setExpandedSectionId(isExpanded ? null : section.id);
                }
              }}
              className="bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 rounded-3xl p-6 w-full shadow-xl backdrop-blur-md relative overflow-hidden flex justify-between items-center text-left transition-colors active:scale-[0.98]"
            >
              {isSectionLocked && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-between px-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-400 mb-1">{section.title}</h2>
                    <p className="text-slate-500 text-sm">Termină testul anterior pentru a debloca</p>
                  </div>
                  <span className="text-4xl opacity-50">🔒</span>
                </div>
              )}
              <div className={clsx(isSectionLocked ? "opacity-0" : "opacity-100")}>
                <h2 className="text-2xl font-extrabold text-white mb-1">{section.title}</h2>
                <p className="text-slate-400 text-sm">{section.description}</p>
              </div>
              <div className={clsx("text-2xl transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0", isSectionLocked ? "opacity-0" : "opacity-50")}>
                🔽
              </div>
            </button>

            {/* Accordion Content */}
            <div className={clsx("w-full overflow-hidden transition-all duration-500 ease-in-out", isExpanded ? "max-h-[2000px] opacity-100 mt-8 mb-8" : "max-h-0 opacity-0 mt-0 mb-0")}>
              <div className="flex flex-col items-center relative w-full space-y-8 py-4">
                {/* The line connecting nodes */}
                <div className="absolute top-0 bottom-0 w-4 bg-slate-800 rounded-full -z-10" />
                {renderedNodes}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
