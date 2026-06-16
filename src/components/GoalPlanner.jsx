import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, Shield, AlertTriangle, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

function GoalPlanner({ onStart, apiKeyMissing }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [isHardcore, setIsHardcore] = useState(false);
  const [usePomodoro, setUsePomodoro] = useState(false);
  const [pomodoroFocus, setPomodoroFocus] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [showHardcoreModal, setShowHardcoreModal] = useState(false);
  const [showNoApiModal, setShowNoApiModal] = useState(false);
  const [topicError, setTopicError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setTopicError(true);
      return;
    }
    setTopicError(false);
    if (minutes <= 0) return;
    
    if (apiKeyMissing) {
      setShowNoApiModal(true);
      return;
    }
    
    if (isHardcore) {
      setShowHardcoreModal(true);
    } else {
      onStart({ topic, minutes, hardcore: false, usePomodoro, pomodoroFocus, pomodoroBreak });
    }
  };

  const confirmHardcore = () => {
    setShowHardcoreModal(false);
    onStart({ topic, minutes, hardcore: true, usePomodoro, pomodoroFocus, pomodoroBreak });
  };

  const confirmNoApi = () => {
    setShowNoApiModal(false);
    if (isHardcore) {
      setShowHardcoreModal(true);
    } else {
      onStart({ topic, minutes, hardcore: false, usePomodoro, pomodoroFocus, pomodoroBreak });
    }
  };

  // Quick-select time presets
  const timePresets = [15, 25, 45, 60];

  return (
    <div>
      {/* Section heading — flat, like web feature sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
          {t('goalPlanner.title')}
        </h2>
        <p className="text-gray-500 font-light text-lg mb-10">
          {t('goalPlanner.subtitle', 'Set your topic, choose your time, and lock in.')}
        </p>
      </motion.div>
      
      {apiKeyMissing && (
        <div className="text-red-400/80 text-sm mb-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          {t('goalPlanner.missingApi')}
        </div>
      )}
      
      <motion.form 
        noValidate
        onSubmit={handleSubmit} 
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Topic Input */}
        <div>
          <label className="block mb-3 text-sm text-gray-500 font-medium tracking-wide">
            {t('goalPlanner.quizTopic')}
          </label>
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('goalPlanner.topicPlaceholder')} 
              value={topic}
              onChange={(e) => { setTopic(e.target.value); if (topicError) setTopicError(false); }}
              className={`w-full bg-white/5 border ${topicError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-5 py-4 text-white text-lg placeholder-gray-600 focus:outline-none transition-colors backdrop-blur-sm`}
            />
            <AnimatePresence>
              {topicError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="absolute -top-12 left-0 bg-[#EF4444] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-2 z-10"
                >
                  <AlertTriangle size={14} /> {t('goalPlanner.requiredField')}
                  {/* Tooltip triangle */}
                  <div className="absolute -bottom-1 left-6 w-3 h-3 bg-[#EF4444] rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Time Selection — presets + custom */}
        <div>
          <label className="block mb-3 text-sm text-gray-500 font-medium tracking-wide">
            {t('goalPlanner.timeInMinutes')}
          </label>
          <div className="flex gap-3 mb-3">
            {timePresets.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setMinutes(preset)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  minutes === preset 
                    ? 'bg-white/15 text-white border border-white/20' 
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                {preset}m
              </button>
            ))}
            <input 
              type="number" 
              min="1" 
              max="120"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value))}
              required
              className="w-20 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white text-sm text-center focus:outline-none focus:border-focus-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Options row — flat toggles */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setUsePomodoro(!usePomodoro)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-medium transition-all border ${
              usePomodoro 
                ? 'bg-white/10 text-white border-white/20' 
                : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-400'
            }`}
          >
            <Clock size={16} />
            {t('goalPlanner.usePomodoro')}
          </button>

          <button
            type="button"
            onClick={() => setIsHardcore(!isHardcore)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-medium transition-all border ${
              isHardcore 
                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-400'
            }`}
          >
            <Shield size={16} />
            {t('goalPlanner.hardcoreMode')}
          </button>
        </div>

        {/* Pomodoro Settings */}
        <AnimatePresence>
          {usePomodoro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-4 overflow-hidden"
            >
              <div>
                <label className="block mb-2 text-xs text-gray-500 font-medium tracking-wide">
                  {t('goalPlanner.pomodoroFocus')}
                </label>
                <input 
                  type="number" min="1" max="120" 
                  value={pomodoroFocus} onChange={e => setPomodoroFocus(parseInt(e.target.value) || 1)}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-center focus:outline-none focus:border-focus-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs text-gray-500 font-medium tracking-wide">
                  {t('goalPlanner.pomodoroBreak')}
                </label>
                <input 
                  type="number" min="1" max="60" 
                  value={pomodoroBreak} onChange={e => setPomodoroBreak(parseInt(e.target.value) || 1)}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-center focus:outline-none focus:border-focus-primary/50 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA — pill-shaped like web buttons */}
        <div className="pt-2">
          <motion.button 
            type="submit" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-focus-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] transition-shadow flex items-center gap-3"
          >
            <Play size={20} fill="currentColor" /> {t('goalPlanner.startFocus')}
          </motion.button>
        </div>
      </motion.form>

      {/* Modals rendered via Portal to escape parent CSS filters/transforms */}
      {createPortal(
        <AnimatePresence>
        {showHardcoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#0B0A15]/95 border border-red-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 mx-auto shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-center mb-3 text-red-400">{t('goalPlanner.hardcoreWarningTitle')}</h3>
              <p className="text-gray-400 text-center mb-8 font-light leading-relaxed">
                {t('goalPlanner.hardcoreWarningDesc')}
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  type="button"
                  onClick={() => setShowHardcoreModal(false)}
                  className="flex-1 py-3 px-4 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-medium border border-white/5"
                >
                  {t('goalPlanner.cancel')}
                </button>
                <button 
                  type="button"
                  onClick={confirmHardcore}
                  className="flex-1 py-3 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  {t('goalPlanner.hardcoreAccept')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showNoApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#0B0A15]/95 border border-orange-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 text-orange-400 mx-auto shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-center mb-3 text-white">{t('goalPlanner.noApiTitle')}</h3>
              <p className="text-gray-400 text-center mb-8 font-light leading-relaxed">
                {t('goalPlanner.noApiDesc')}
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  type="button"
                  onClick={() => setShowNoApiModal(false)}
                  className="flex-1 py-3 px-4 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-medium border border-white/5"
                >
                  {t('goalPlanner.cancel')}
                </button>
                <button 
                  type="button"
                  onClick={confirmNoApi}
                  className="flex-1 py-3 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  {t('goalPlanner.continueWithoutApi')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default GoalPlanner;
