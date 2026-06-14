import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Trophy, LogOut, LayoutDashboard } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import GoalPlanner from './components/GoalPlanner';
import TimerScreen from './components/TimerScreen';
import QuizScreen from './components/QuizScreen';
import Settings from './components/Settings';
import AuthScreen from './components/AuthScreen';
import SocialScreen from './components/SocialScreen';
import SplashScreen from './components/SplashScreen';
import SoftAurora from './components/SoftAurora';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [phase, setPhase] = useState('IDLE'); // IDLE, FOCUS, QUIZ, SETTINGS, SOCIAL
  const [userData, setUserData] = useState(null);
  const [currentGoal, setCurrentGoal] = useState({ topic: '', minutes: 25, hardcore: false });
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load data from Firestore
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          let stats = { xp: 0, level: 1, goalsCompleted: 0 };
          if (docSnap.exists()) {
            const data = docSnap.data();
            stats = { xp: data.xp || 0, level: data.level || 1, goalsCompleted: data.goalsCompleted || 0 };
          }
          
          // Load local settings via IPC or fallback
          let localSettings = { apiKey: '', blacklist: ['discord', 'steam'] };
          if (window.api && window.api.storage) {
            const stored = await window.api.storage.load();
            if (stored && stored.settings) localSettings = stored.settings;
          }
          
          setUserData({ stats, settings: localSettings });
        } catch(e) {
          console.error("Error loading user data", e);
          // Fallback if Firestore fails (e.g. permission denied)
          setUserData({ 
            stats: { xp: 0, level: 1, goalsCompleted: 0 }, 
            settings: { apiKey: '', blacklist: ['discord', 'steam'] },
            error: e.message
          });
        }
      } else {
        setUserData(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleSaveSettings = (newSettings) => {
    const newData = { ...userData, settings: newSettings };
    setUserData(newData);
    if (window.api && window.api.storage) {
      window.api.storage.save(newData); // We only save settings locally now, stats are in Firebase
    }
  };

  const handleStartFocus = (goal) => {
    setCurrentGoal(goal);
    setPhase('FOCUS');
    
    // Start block
    if (window.api && window.api.blocker) {
      window.api.blocker.start(userData.settings.blacklist, goal.hardcore);
    }

    // Generate questions
    if (window.api && window.api.gemini && userData.settings.apiKey) {
      window.api.gemini.generate(goal.topic, userData.settings.apiKey, i18n.language)
        .then(res => {
          if (res.questions) setQuizData(res.questions);
        });
    }
  };

  const handleFocusComplete = () => {
    if (window.api && window.api.blocker) window.api.blocker.stop();
    setPhase('QUIZ');
  };

  const handleFocusAbort = () => {
    if (window.api && window.api.blocker) window.api.blocker.stop();
    setPhase('IDLE');
  };

  const handleQuizSubmit = async (score, feedback) => {
    const xpGained = Math.round((score / 10) * 50) + 10;
    const newStats = { ...userData.stats };
    newStats.xp += xpGained;
    newStats.goalsCompleted += 1;
    
    if (newStats.xp >= newStats.level * 100) {
      newStats.xp -= newStats.level * 100;
      newStats.level += 1;
    }
    
    setUserData({ ...userData, stats: newStats });
    setPhase('IDLE');

    // Sync to Firestore
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          xp: newStats.xp,
          level: newStats.level,
          goalsCompleted: newStats.goalsCompleted
        });
      } catch(e) {
        console.error("Error saving XP to firestore", e);
      }
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
        <SoftAurora
          speed={0.25}
          scale={1.5}
          brightness={0.6}
          color1="#8B5CF6"
          color2="#EC4899"
          enableMouseInteraction={true}
          mouseInfluence={0.3}
        />
      </div>

      {authLoading && (
        <div className="container flex-center" style={{ height: '100vh' }}>
          {t('app.verifying')}
        </div>
      )}

      {!authLoading && !currentUser && (
        <div className="container flex-center" style={{ height: '100vh' }}>
          <AuthScreen />
        </div>
      )}

      {!authLoading && currentUser && !userData && (
        <div className="container flex-center" style={{ height: '100vh' }}>
          {t('app.loadingProfile')}
        </div>
      )}

      {!authLoading && currentUser && userData && (
        <div className="app-layout">
          {userData.error && (
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100, background: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', padding: '12px', borderRadius: '8px', fontSize: '14px', border: '1px solid rgba(244,63,94,0.3)' }}>
              {t('app.dbError', { error: userData.error })}
            </div>
          )}

          {/* Sidebar */}
          <div className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--cta))' }}></div>
              <h2 className="text-gradient" style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Focus</h2>
            </div>

            <div className="sidebar-nav">
              <div className={`nav-item ${(phase === 'IDLE' || phase === 'FOCUS' || phase === 'QUIZ') ? 'active' : ''}`} onClick={() => setPhase('IDLE')}>
                <LayoutDashboard size={20} /> {t('app.dashboard')}
              </div>
              <div className={`nav-item ${phase === 'SOCIAL' ? 'active' : ''}`} onClick={() => setPhase('SOCIAL')}>
                <Trophy size={20} /> {t('app.community')}
              </div>
              <div className={`nav-item ${phase === 'SETTINGS' ? 'active' : ''}`} onClick={() => setPhase('SETTINGS')}>
                <SettingsIcon size={20} /> {t('app.settings')}
              </div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ padding: '8px 16px', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                {t('app.level')} <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{userData.stats.level}</span> ({userData.stats.xp} XP)
              </div>
              <div className="nav-item" onClick={() => signOut(auth)} style={{ color: 'var(--text-muted)' }}>
                <LogOut size={20} /> {t('app.logout')}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            <div className="container" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0' }}>
            <AnimatePresence mode="wait">
              {phase === 'IDLE' && (
                <motion.div
                  key="IDLE"
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <Dashboard stats={userData.stats} />
                  <GoalPlanner onStart={handleStartFocus} apiKeyMissing={!userData.settings.apiKey} />
                </motion.div>
              )}

              {phase === 'SOCIAL' && (
                <motion.div
                  key="SOCIAL"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <SocialScreen />
                </motion.div>
              )}

              {phase === 'FOCUS' && (
                <motion.div
                  key="FOCUS"
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                >
                  <TimerScreen 
                    minutes={currentGoal.minutes} 
                    topic={currentGoal.topic} 
                    isHardcore={currentGoal.hardcore}
                    usePomodoro={currentGoal.usePomodoro}
                    onComplete={handleFocusComplete} 
                    onAbort={handleFocusAbort} 
                    onPhaseChange={(newPhase) => {
                      if (newPhase === 'PAUSE') {
                        if (window.api && window.api.blocker) window.api.blocker.stop();
                      } else if (newPhase === 'FOCUS') {
                        if (window.api && window.api.blocker) window.api.blocker.start(userData.settings.blacklist, currentGoal.hardcore);
                      }
                    }}
                  />
                </motion.div>
              )}

              {phase === 'QUIZ' && (
                <motion.div
                  key="QUIZ"
                  initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <QuizScreen 
                    quizData={quizData} 
                    apiKey={userData.settings.apiKey}
                    onSubmit={handleQuizSubmit} 
                  />
                </motion.div>
              )}

              {phase === 'SETTINGS' && (
                <motion.div
                  key="SETTINGS"
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <Settings 
                    settings={userData.settings} 
                    onSave={(newSettings) => handleSaveSettings(newSettings)} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
