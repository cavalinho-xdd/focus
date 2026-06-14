import React, { useState, useEffect } from 'react';
import { XSquare, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function TimerScreen({ minutes, topic, isHardcore, usePomodoro, onComplete, onAbort, onPhaseChange }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  
  const POMODORO_FOCUS_SEC = 25 * 60;
  const POMODORO_BREAK_SEC = 5 * 60;
  
  const [phase, setPhase] = useState('FOCUS');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(usePomodoro ? Math.min(POMODORO_FOCUS_SEC, minutes * 60) : minutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });

      if (usePomodoro) {
        setPhaseTimeLeft((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            setPhase((currentPhase) => {
              const newPhase = currentPhase === 'FOCUS' ? 'BREAK' : 'FOCUS';
              if (onPhaseChange) onPhaseChange(newPhase);
              return newPhase;
            });
            return 0; 
          }
          return prevPhaseTime - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete, usePomodoro, onPhaseChange]);

  useEffect(() => {
    if (usePomodoro && phaseTimeLeft === 0 && timeLeft > 0) {
      const nextDuration = phase === 'FOCUS' ? POMODORO_FOCUS_SEC : POMODORO_BREAK_SEC;
      setPhaseTimeLeft(Math.min(nextDuration, timeLeft));
    }
  }, [phase, phaseTimeLeft, timeLeft, usePomodoro]);

  const displayTime = usePomodoro ? phaseTimeLeft : timeLeft;
  const m = Math.floor(displayTime / 60).toString().padStart(2, '0');
  const s = (displayTime % 60).toString().padStart(2, '0');

  const totalM = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const totalS = (timeLeft % 60).toString().padStart(2, '0');

  const circumference = 2 * Math.PI * 120;
  const progressTime = usePomodoro ? phaseTimeLeft : timeLeft;
  const totalDuration = usePomodoro ? (phase === 'FOCUS' ? POMODORO_FOCUS_SEC : POMODORO_BREAK_SEC) : (minutes * 60);
  const strokeDashoffset = circumference - (Math.min(progressTime, totalDuration) / totalDuration) * circumference;

  const colorPrimary = phase === 'FOCUS' ? '#8B5CF6' : '#10B981';
  const colorCta = phase === 'FOCUS' ? '#EC4899' : '#34D399';

  return (
    <div className="glass-panel flex-center" style={{ flexDirection: 'column', height: '100%', position: 'relative' }}>
      <h3 className="text-muted" style={{ marginBottom: '40px', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '14px' }}>
        {t('timerScreen.focusTopic', { topic })}
      </h3>
      
      <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="280" height="280" viewBox="0 0 280 280" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="140" cy="140" r="120" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle 
            cx="140" cy="140" r="120" 
            fill="transparent" 
            stroke={`url(#gradient-${phase})`} 
            strokeWidth="8" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
          <defs>
            <linearGradient id={`gradient-${phase}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorPrimary} />
              <stop offset="100%" stopColor={colorCta} />
            </linearGradient>
          </defs>
        </svg>
        
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          {usePomodoro && (
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: colorCta, letterSpacing: '2px', marginBottom: '8px' }}>
              {phase === 'FOCUS' ? t('timerScreen.phaseFocus') : t('timerScreen.phaseBreak')}
            </div>
          )}
          <div style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1', fontFamily: 'monospace' }}>
            {m}:{s}
          </div>
          {!usePomodoro && (
            <div className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
              {t('timerScreen.timeRemaining')}
            </div>
          )}
          {usePomodoro && (
            <div className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>
              Total: {totalM}:{totalS}
            </div>
          )}
        </div>
      </div>

      {!isHardcore && (
        <div style={{ marginTop: '60px' }}>
          <button className="secondary" onClick={onAbort}>
            <XSquare size={18} /> {t('timerScreen.cancelFocus')}
          </button>
        </div>
      )}
      {isHardcore && (
        <div style={{ marginTop: '40px' }}>
          <h3 className="text-muted" style={{ fontSize: '16px', fontWeight: 'normal', marginBottom: '8px' }}>
            {phase === 'FOCUS' ? t('timerScreen.focusingOn') : ''}
          </h3>
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
            {phase === 'FOCUS' ? topic : t('timerScreen.breakActive')}
          </h2>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '16px' }}>
            <Shield size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Hardcore Mode Active
          </p>
        </div>
      )}
    </div>
  );
}

export default TimerScreen;
