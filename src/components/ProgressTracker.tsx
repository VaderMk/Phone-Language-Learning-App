// Removed React import
import { motion } from 'framer-motion';

interface ProgressTrackerProps {
  current: number;
  total: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ current, total }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (current / total) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-2 mb-8">
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            className="text-slate-800"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          <motion.circle
            className="text-indigo-500"
            strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>
        <div className="absolute text-xl font-bold text-slate-200">
          {current}/{total}
        </div>
      </div>
      <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">Progress</p>
    </div>
  );
};
