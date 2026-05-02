import React from 'react';
import { learningPath, type LessonNode } from '../data/path';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface LearningPathProps {
  completedNodes: string[];
  onSelectNode: (node: LessonNode) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ completedNodes, onSelectNode }) => {
  const getOffset = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return 'translate-x-0';
    if (cycle === 1) return '-translate-x-8';
    if (cycle === 2) return '-translate-x-12';
    if (cycle === 3) return '-translate-x-8';
    return 'translate-x-0';
  };

  const getBgColor = (type: LessonNode['type'], isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return 'bg-slate-700 border-slate-600 text-slate-500';
    if (isCompleted) return 'bg-amber-400 border-amber-500 text-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]';
    
    switch (type) {
      case 'word': return 'bg-indigo-500 border-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]';
      case 'sentence': return 'bg-rose-500 border-rose-600 text-white shadow-[0_0_20px_rgba(244,63,113,0.6)]';
      case 'chest': return 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]';
      case 'trophy': return 'bg-fuchsia-500 border-fuchsia-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.6)]';
      default: return 'bg-indigo-500';
    }
  };

  const getIcon = (type: LessonNode['type'], isCompleted: boolean) => {
    if (isCompleted) return '⭐';
    switch (type) {
      case 'word': return '📝';
      case 'sentence': return '💬';
      case 'chest': return '🎁';
      case 'trophy': return '🏆';
      default: return '📝';
    }
  };

  let allPreviousCompleted = true;

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 flex flex-col items-center custom-scrollbar overflow-y-auto overflow-x-hidden h-full">
      {learningPath.map((section) => (
        <div key={section.id} className="w-full flex flex-col items-center mb-16">
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 w-full mb-12 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-extrabold text-white mb-2">{section.title}</h2>
            <p className="text-slate-400">{section.description}</p>
          </div>

          <div className="flex flex-col items-center relative w-full space-y-8">
            {/* The line connecting nodes */}
            <div className="absolute top-0 bottom-0 w-4 bg-slate-800 rounded-full -z-10" />

            {section.nodes.map((node, index) => {
              const isCompleted = completedNodes.includes(node.id);
              const isLocked = !allPreviousCompleted && !isCompleted;
              
              if (!isCompleted) {
                allPreviousCompleted = false;
              }

              return (
                <div key={node.id} className={clsx("flex flex-col items-center", getOffset(index))}>
                  <motion.button
                    whileTap={isLocked ? {} : { scale: 0.9 }}
                    whileHover={isLocked ? {} : { scale: 1.05 }}
                    onClick={() => !isLocked && onSelectNode(node)}
                    className={clsx(
                      "w-20 h-20 rounded-full flex items-center justify-center text-3xl border-b-8 transition-colors",
                      getBgColor(node.type, isCompleted, isLocked),
                      isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                    )}
                  >
                    {getIcon(node.type, isCompleted)}
                  </motion.button>
                  <span className="mt-3 font-bold text-slate-300 bg-slate-900/50 px-3 py-1 rounded-full text-sm">
                    {node.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
