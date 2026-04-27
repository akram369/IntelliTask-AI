import { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RotateCcw, CheckCircle, Target, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FocusMode = ({ task, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setIsFinished(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-3xl p-6"
    >
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
         <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all click-feedback px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Operating System
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             Neural Session Active
          </div>
      </div>

      <div className="w-full max-w-2xl relative">
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="bg-white border border-slate-200/60 p-12 md:p-16 rounded-[4rem] text-center space-y-12 relative overflow-hidden shadow-2xl shadow-primary-900/10"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-primary-500/5 to-transparent blur-[100px] pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary-100/50">
              <Sparkles className="w-3.5 h-3.5" />
              Focus Protocol Initiated
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-lg mx-auto">{task?.title}</h2>
            <div className="flex items-center justify-center gap-3 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
               <Target className="w-4 h-4 text-primary-500" /> Current Objective: {task?.context}
            </div>
          </div>

          {/* Premium Timer Visualization */}
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center group z-10">
             <svg className="w-full h-full -rotate-90 filter drop-shadow-sm">
                <circle
                  cx="160"
                  cy="160"
                  r="145"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="160"
                  cy="160"
                  r="145"
                  stroke="url(#timerGradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="911"
                  initial={{ strokeDashoffset: 911 }}
                  animate={{ strokeDashoffset: 911 - (911 * progress) / 100 }}
                  transition={{ ease: "linear" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-white/50 backdrop-blur-sm rounded-full m-8">
                <span className="text-7xl font-mono font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Clock className="w-3.5 h-3.5" /> T-Minus
                </div>
             </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4 relative z-10">
            <button 
              onClick={toggleTimer}
              className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all click-feedback shadow-xl ${
                isActive ? 'bg-amber-50 text-amber-600 border border-amber-200 shadow-amber-900/5' : 'bg-slate-900 text-white shadow-slate-950/20'
              }`}
            >
              {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-20 h-20 rounded-3xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all click-feedback shadow-sm hover:border-slate-300"
            >
              <RotateCcw className="w-8 h-8" />
            </button>
          </div>

          <AnimatePresence>
            {isFinished && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="pt-8 relative z-10"
              >
                <button 
                  onClick={() => onComplete(task.id)}
                  className="w-full py-6 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/20 transition-all click-feedback"
                >
                  <CheckCircle className="w-7 h-7" />
                  Objective Achieved
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FocusMode;
