import React, { useState } from 'react';
import { Play, Shield, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function GoalPlanner({ onStart, apiKeyMissing }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [isHardcore, setIsHardcore] = useState(false);
  const [usePomodoro, setUsePomodoro] = useState(false);
  const [showHardcoreModal, setShowHardcoreModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic || minutes <= 0) return;
    
    if (isHardcore) {
      setShowHardcoreModal(true);
    } else {
      onStart({ topic, minutes, hardcore: false, usePomodoro });
    }
  };

  const confirmHardcore = () => {
    setShowHardcoreModal(false);
    onStart({ topic, minutes, hardcore: true, usePomodoro });
  };

  return (
    <div className="panel mt-4">
      <h2 className="text-gradient" style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>{t('goalPlanner.title')}</h2>
      {apiKeyMissing && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#FCA5A5', 
          padding: '12px', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {t('goalPlanner.missingApi')}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {t('goalPlanner.quizTopic')}
          </label>
          <input 
            type="text" 
            placeholder={t('goalPlanner.topicPlaceholder')} 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {t('goalPlanner.timeInMinutes')}
          </label>
          <input 
            type="number" 
            min="1" 
            max="120"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="mb-4" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: usePomodoro ? '1px solid var(--primary)' : '1px solid transparent' }}>
            <input 
              type="checkbox" 
              checked={usePomodoro}
              onChange={(e) => setUsePomodoro(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', margin: 0, padding: 0 }}
            />
            <span style={{ color: usePomodoro ? 'var(--primary)' : 'var(--text-muted)', fontWeight: usePomodoro ? 'bold' : 'normal', fontSize: '15px' }}>
              {t('goalPlanner.usePomodoro')}
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: isHardcore ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent' }}>
            <input 
              type="checkbox" 
              checked={isHardcore}
              onChange={(e) => setIsHardcore(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#EF4444', margin: 0, padding: 0 }}
            />
            <Shield size={18} color={isHardcore ? '#EF4444' : 'var(--text-muted)'} />
            <span style={{ color: isHardcore ? '#EF4444' : 'var(--text-muted)', fontWeight: isHardcore ? 'bold' : 'normal', fontSize: '15px' }}>
              {t('goalPlanner.hardcoreMode')}
            </span>
          </label>
        </div>

        <button type="submit" className="cta" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          <Play size={20} fill="currentColor" /> {t('goalPlanner.startFocus')}
        </button>
      </form>

      {/* Hardcore Disclaimer Modal */}
      {showHardcoreModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="panel" style={{ maxWidth: '400px', border: '1px solid rgba(239, 68, 68, 0.3)', background: '#1e1b2e' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <AlertTriangle size={48} color="#EF4444" />
            </div>
            <h3 style={{ textAlign: 'center', color: '#EF4444', marginBottom: '16px' }}>
              {t('goalPlanner.hardcoreWarningTitle')}
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '30px' }}>
              {t('goalPlanner.hardcoreWarningDesc')}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setShowHardcoreModal(false)}>
                Zrušit
              </button>
              <button type="button" className="cta" style={{ flex: 1, background: '#EF4444', boxShadow: 'none' }} onClick={confirmHardcore}>
                {t('goalPlanner.hardcoreAccept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalPlanner;
