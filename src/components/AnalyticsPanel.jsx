import React, { useState } from 'react';
import { motion } from 'framer-motion';

function fmt(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayLabel(dateStr) {
  return DAY_ABBR[new Date(dateStr + 'T12:00:00').getDay()];
}

/* ── Weekly bar chart ── */
function WeekBarChart({ dailyTotals }) {
  const [hovered, setHovered] = useState(null);
  const maxMinutes = Math.max(...dailyTotals.map(d => d.minutes), 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-end gap-2">
      {dailyTotals.map((d, i) => {
        const isToday = d.date === today;
        const fillPct = d.minutes > 0 ? Math.max((d.minutes / maxMinutes) * 100, 6) : 0;

        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-2 group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            <div className={`text-xs font-mono tabular-nums font-medium transition-opacity duration-150 ${
              hovered === i && d.minutes > 0 ? 'text-white opacity-100' : 'opacity-0'
            }`}>
              {fmt(d.minutes)}
            </div>

            {/* Bar track */}
            <div className="w-full h-16 rounded-[5px] bg-white/[0.04] relative overflow-hidden">
              {fillPct > 0 && (
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 rounded-[5px] ${
                    isToday ? 'bg-focus-primary' : 'bg-white/20'
                  }`}
                  style={{
                    boxShadow: isToday ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
                  }}
                  initial={{ height: '0%' }}
                  animate={{ height: `${fillPct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                />
              )}
            </div>

            {/* Day label */}
            <span className={`text-xs font-medium uppercase tracking-wide leading-none transition-colors duration-150 ${
              isToday ? 'text-violet-400' : 'text-gray-500'
            }`}>
              {getDayLabel(d.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Topic breakdown ── */
function TopicBreakdown({ topicTotals }) {
  if (!topicTotals.length) return null;
  const maxMin = topicTotals[0].minutes;

  return (
    <div className="flex flex-col gap-3">
      {topicTotals.map((t, i) => (
        <motion.div
          key={t.topic}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
        >
          <span className="text-gray-400 text-xs w-28 truncate shrink-0 leading-none">{t.topic}</span>

          <div className="flex-1 h-[3px] bg-white/[0.05] rounded-full relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 h-full rounded-full bg-focus-primary/60"
              initial={{ width: '0%' }}
              animate={{ width: `${(t.minutes / maxMin) * 100}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.08 }}
            />
          </div>

          <span className="text-gray-400 text-xs font-mono tabular-nums w-12 text-right shrink-0 leading-none">
            {fmt(t.minutes)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Summary stat chips ── */
function SummaryStats({ summary }) {
  const chips = [
    { label: 'This week', value: fmt(summary.weekMinutes) },
    { label: 'Sessions / 30d', value: String(summary.monthSessions) },
    { label: 'Best day', value: fmt(summary.bestDayMinutes) },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {chips.map((c, i) => (
        <motion.div
          key={c.label}
          className="glass-surface rounded-xl px-3.5 py-3 flex flex-col gap-1.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
        >
          <span className="text-white text-base font-bold font-mono tabular-nums leading-none">
            {c.value}
          </span>
          <span className="text-gray-500 text-xs tracking-wider uppercase font-semibold leading-none">
            {c.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Composed panel ── */
function AnalyticsPanel({ dailyTotals, topicTotals, summary }) {
  return (
    <motion.div
      className="flex flex-col gap-7 mt-10 pt-10 border-t border-white/[0.06]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3 className="text-sm font-semibold text-white leading-none">Focus overview</h3>

      <WeekBarChart dailyTotals={dailyTotals} />

      <SummaryStats summary={summary} />

      {topicTotals.length > 0 && <TopicBreakdown topicTotals={topicTotals} />}

      {/* Empty nudge */}
      {!dailyTotals.some(d => d.minutes > 0) && (
        <p className="text-gray-700 text-xs text-center -mt-2">
          Complete a session to see your weekly chart.
        </p>
      )}
    </motion.div>
  );
}

export default AnalyticsPanel;
