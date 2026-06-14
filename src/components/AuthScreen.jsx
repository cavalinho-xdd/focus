import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function AuthScreen() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName) throw new Error(t('authScreen.nicknameRequired'));
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check uniqueness of nickname now that user is authenticated
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", displayName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteUser(user);
          throw new Error(t('authScreen.nicknameInUse'));
        }
        
        // Nastavit jméno profilu Auth
        await updateProfile(user, { displayName });
        
        // Založit záznam v databázi pro leaderboards atd.
        await setDoc(doc(db, "users", user.uid), {
          displayName,
          email,
          xp: 0,
          level: 1,
          goalsCompleted: 0,
          friends: []
        });

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError(t('authScreen.emailInUse'));
      else if (err.code === 'auth/invalid-credential') setError(t('authScreen.invalidCreds'));
      else setError(err.message || t('authScreen.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="panel" 
      style={{ maxWidth: '400px', margin: '40px auto', width: '100%' }}
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '24px', letterSpacing: '-0.02em' }}>
        <span style={{ color: 'var(--secondary)' }}>Focus</span> Auth
      </h2>
      
      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '12px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>{t('authScreen.nickname')}</label>
            <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Procrastinator123" />
          </div>
        )}
        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>{t('authScreen.email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="focus@example.com" />
        </div>
        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>{t('authScreen.password')}</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength="6" />
        </div>

        <button type="submit" className="cta" disabled={loading} style={{ width: '100%', marginTop: '8px', padding: '14px' }}>
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading ? t('authScreen.processing') : (isRegister ? t('authScreen.createAccount') : t('authScreen.login'))}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="secondary" onClick={() => setIsRegister(!isRegister)} style={{ fontSize: '14px' }}>
          {isRegister ? t('authScreen.hasAccount') : t('authScreen.noAccount')}
        </button>
      </div>
    </motion.div>
  );
}

export default AuthScreen;
