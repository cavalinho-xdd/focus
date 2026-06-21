import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import {
  Target, TrendingUp, BarChart2, Hash, Flame, CalendarCheck,
  Zap, Clock, Timer, BookOpen, Sunrise, Moon,
} from 'lucide-react';
import { db } from '../firebase';
import AnalyticsPanel from './AnalyticsPanel';
import { buildDailyTotals, buildTopicTotals, buildSummary } from '../utils/analyticsHelpers';
import { ACHIEVEMENTS } from '../utils/achievements';

const ICON_MAP = {
  Target, TrendingUp, BarChart2, Hash, Flame, CalendarCheck,
  Zap, Clock, Timer, BookOpen, Sunrise, Moon,
};

const ACHIEVEMENT_GROUPS = [
  { label: 'Volume', ids: ['first-focus', 'momentum', 'sessions-30', 'century'] },
  { label: 'Consistency', ids: ['week-streak', 'streak-30'] },
  { label: 'Time', ids: ['hour-marathon', 'time-lord', 'deep-work'] },
  { label: 'Range', ids: ['scholar', 'early-bird', 'night-owl'] },
];

function fmt(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

function AchievementTile({ achievement, unlocked, stats, history, index }) {
  const [showTip, setShowTip] = useState(false);
  const Icon = ICON_MAP[achievement.iconName];
  const prog = achievement.progress ? achievement.progress(stats, history) : null;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${achievement.label}. ${achievement.desc}`}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/50 ${
        unlocked ? 'glass-surface-elevated' : 'glass-surface'
      }`}
      style={unlocked ? { boxShadow: '0 0 16px rgba(139,92,246,0.12)' } : {}}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: unlocked ? 1 : 0.35, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onFocus={() => setShowTip(true)}
      onBlur={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
    >
      {showTip && (
        <div 
          role="tooltip"
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
          bg-black/90 backdrop-blur text-white text-xs font-medium px-3 py-2
          rounded-lg border border-white/10 pointer-events-none shadow-xl"
        >
          {achievement.desc}
          {prog && !unlocked && (
            <span className="text-gray-400 ml-1">({prog.value}/{prog.max})</span>
          )}
        </div>
      )}

      <div aria-hidden="true" className={unlocked ? 'text-violet-400' : 'text-gray-600'}>
        {Icon && <Icon size={20} strokeWidth={1.5} />}
      </div>
      <span className={`text-xs font-medium tracking-wide text-center leading-tight ${
        unlocked ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {achievement.label}
      </span>

      {prog && !unlocked && prog.value > 0 && (
        <span className="text-xs font-mono text-gray-500 tabular-nums">
          {prog.value}/{prog.max}
        </span>
      )}
    </motion.div>
  );
}

function ProfileScreen({ stats, userName, userId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, `users/${userId}/history`),
          orderBy('date', 'desc'),
          limit(90),
        );
        const snap = await getDocs(q);
        const docs = [];
        snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
        setHistory(docs);
      } catch (e) {
        console.error('Profile history fetch failed:', e);
      }
    };
    fetchHistory();
  }, [userId]);

  const dailyTotals = buildDailyTotals(history);
  const topicTotals = buildTopicTotals(history);
  const summary = buildSummary(history);

  const initial = (userName || '?')[0].toUpperCase();
  
  const unlockedMap = React.useMemo(() => {
    const map = {};
    ACHIEVEMENTS.forEach(a => {
      map[a.id] = a.check(stats, history);
    });
    return map;
  }, [stats, history]);
  
  const unlockedCount = Object.values(unlockedMap).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-12">
      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-20 h-20 rounded-full bg-focus-primary/20 border-2 border-focus-primary/35
          flex items-center justify-center shrink-0
          shadow-[0_0_24px_rgba(139,92,246,0.15)]">
          <span className="text-3xl font-black text-focus-primary font-mono">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-white leading-none mb-2">
            {userName || 'Focuser'}
          </h1>
          <div className="flex items-center gap-3 text-sm font-mono text-gray-400 mb-3">
            <span className="text-focus-primary font-semibold">Lv.{stats.level}</span>
            <span className="text-gray-700">·</span>
            <span>{stats.goalsCompleted} sessions</span>
            <span className="text-gray-700">·</span>
            <span>{fmt(stats.totalFocusMinutes)} focus</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-focus-primary/70 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.xp / (stats.level * 100)) * 100, 100)}%` }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="text-xs text-gray-500 font-mono tabular-nums shrink-0">
              {stats.xp} / {stats.level * 100} XP
            </span>
          </div>
        </div>
      </motion.div>

      <AnalyticsPanel dailyTotals={dailyTotals} topicTotals={topicTotals} summary={summary} />

      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-white leading-none">
            Achievements
          </h3>
          <span className="text-xs text-gray-500 font-mono tabular-nums">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </span>
        </div>

        {ACHIEVEMENT_GROUPS.map(group => (
          <div key={group.label} className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase">{group.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.ids.map((id, i) => {
                const a = ACHIEVEMENTS.find(x => x.id === id);
                if (!a) return null;
                return (
                  <AchievementTile
                    key={a.id}
                    achievement={a}
                    unlocked={unlockedMap[a.id]}
                    stats={stats}
                    history={history}
                    index={i}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default ProfileScreen;
