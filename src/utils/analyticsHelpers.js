export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export function buildDailyTotals(history) {
  const days = getLast7Days();
  const byDay = {};
  history.forEach(s => {
    const day = s.date?.split('T')[0];
    if (day) byDay[day] = (byDay[day] || 0) + (s.minutes || 0);
  });
  return days.map(date => ({ date, minutes: byDay[date] || 0 }));
}

export function buildTopicTotals(history) {
  const byTopic = {};
  history.forEach(s => {
    if (!s.topic) return;
    const key = s.topic.trim().toLowerCase();
    byTopic[key] = {
      topic: s.topic.trim(),
      minutes: (byTopic[key]?.minutes || 0) + (s.minutes || 0),
    };
  });
  return Object.values(byTopic).sort((a, b) => b.minutes - a.minutes).slice(0, 5);
}

export function buildSummary(history) {
  const today = new Date();
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
  const monthAgo = new Date(today); monthAgo.setDate(today.getDate() - 29);

  let weekMinutes = 0, monthSessions = 0;
  const dayMap = {};

  history.forEach(s => {
    const d = new Date(s.date);
    if (d >= weekAgo) weekMinutes += s.minutes || 0;
    if (d >= monthAgo) monthSessions += 1;
    const key = s.date?.split('T')[0];
    if (key) dayMap[key] = (dayMap[key] || 0) + (s.minutes || 0);
  });

  const vals = Object.values(dayMap);
  const bestDayMinutes = vals.length > 0 ? Math.max(...vals) : 0;
  return { weekMinutes, monthSessions, bestDayMinutes };
}
