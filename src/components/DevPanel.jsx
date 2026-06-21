import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Sparkles, Play, FastForward, RotateCcw, AlertTriangle, MessageSquare, WifiOff } from 'lucide-react';

function DevPanel({ 
  onClose, 
  onTriggerStreak, 
  phase, 
  setPhase, 
  isOffline, 
  setIsOffline, 
  onTestToast, 
  onForceTour, 
  onForceQuiz 
}) {
  const [streakValue, setStreakValue] = useState(3);

  const streakPresets = [
    { label: 'Spark', streak: 1 },
    { label: 'Burning', streak: 5 },
    { label: 'Blazing', streak: 10 },
  ];

  const phases = ['IDLE', 'FOCUS', 'QUIZ', 'BACKLOG', 'PROFILE', 'SOCIAL', 'SETTINGS'];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-[9990] w-80 max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-[#13111C] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-focus-primary" />
              <span className="text-sm font-bold text-white tracking-wide">Dev Tools</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-focus-primary/20 text-focus-primary font-bold">ALPHA</span>
            </div>
            <button onClick={onClose} aria-label="Close Developer Panel" className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            
            {/* Phase Jumping */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FastForward size={14} className="text-focus-primary" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Phase Jump</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {phases.map(p => (
                  <button
                    key={p}
                    onClick={() => setPhase(p)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors border ${
                      phase === p
                        ? 'bg-focus-primary/20 text-focus-primary border-focus-primary/30'
                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">App State</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onForceQuiz}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors border border-white/5 flex items-center justify-center gap-1.5"
                >
                  <Play size={12} /> Force Quiz
                </button>
                <button
                  onClick={onForceTour}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors border border-white/5 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={12} /> Play Tour Now
                </button>
              </div>
            </div>

            {/* Network / Offline */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <WifiOff size={14} className={isOffline ? "text-red-400" : "text-gray-500"} />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Network</span>
              </div>
              <button
                onClick={() => setIsOffline(!isOffline)}
                className={`w-full py-2 px-3 rounded-lg font-medium text-xs transition-colors flex items-center justify-between border ${
                  isOffline 
                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Force Offline Mode</span>
                <span className="font-mono text-[10px]">{isOffline ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Toasts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-blue-400" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Toasts</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onTestToast('success')}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-1.5 rounded-md font-medium transition-colors"
                >
                  Success
                </button>
                <button
                  onClick={() => onTestToast('info')}
                  className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs py-1.5 rounded-md font-medium transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={() => onTestToast('error')}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-1.5 rounded-md font-medium transition-colors"
                >
                  Error (Action)
                </button>
              </div>
            </div>

            {/* Streak Animation Tester */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame size={14} className="text-orange-400" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Streak Animation</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {streakPresets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setStreakValue(p.streak)}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                      streakValue === p.streak
                        ? 'bg-white/10 text-white border-white/20'
                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {p.label} ({p.streak})
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={streakValue}
                  onChange={(e) => setStreakValue(parseInt(e.target.value) || 1)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-focus-primary/50 transition-colors"
                />
                <button
                  onClick={() => onTriggerStreak(streakValue)}
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-orange-600 transition-colors"
                >
                  <Play size={12} fill="currentColor" /> Fire
                </button>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-2 border-t border-white/5 bg-black/20 text-center text-[9px] text-gray-600 font-mono tracking-widest uppercase">
            Ctrl+Shift+D to toggle
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DevPanel;
