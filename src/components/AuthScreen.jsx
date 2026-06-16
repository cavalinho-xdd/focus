import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, deleteUser, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: true });
      setError(t('goalPlanner.requiredField'));
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      console.error(err);
      setError(err.message || t('authScreen.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (isRegister && !displayName.trim()) errors.displayName = true;
    if (!email.trim()) errors.email = true;
    if (!password.trim()) errors.password = true;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName) throw new Error(t('authScreen.nicknameRequired'));
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", displayName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteUser(user);
          throw new Error(t('authScreen.nicknameInUse'));
        }
        
        await updateProfile(user, { displayName });
        
        await setDoc(doc(db, "users", user.uid), {
          displayName,
          email,
          xp: 0,
          level: 1,
          goalsCompleted: 0,
          friends: []
        });

        // Send verification email
        await sendEmailVerification(user);

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
      className="max-w-sm w-full mx-4" 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Branding */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-focus-primary to-focus-secondary shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
        <span className="text-2xl font-bold tracking-tight">focus</span>
      </div>

      <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
        {isRegister ? t('authScreen.createAccount', 'Create account') : t('authScreen.welcomeBack', 'Welcome back')}
      </h2>
      <p className="text-gray-500 font-light mb-10">
        {isRegister ? t('authScreen.registerSubtitle', 'Start earning your focus.') : t('authScreen.loginSubtitle', 'Pick up where you left off.')}
      </p>
      
      {error && (
        <div className="text-red-400/80 text-sm mb-6 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
          <span>{error}</span>
        </div>
      )}

      {resetSent && (
        <div className="text-green-400/80 text-sm mb-6 flex items-start gap-2 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
          <span>{t('authScreen.resetLinkSent')}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isRegister && (
          <div>
            <label className="block mb-2 text-sm text-gray-500 font-medium">{t('authScreen.nickname')}</label>
            <div className="relative">
              <input 
                type="text" value={displayName} 
                onChange={(e) => { setDisplayName(e.target.value); setFieldErrors(prev => ({...prev, displayName: false})) }} 
                placeholder="Procrastinator123" 
                className={`w-full bg-white/5 border ${fieldErrors.displayName ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors`}
              />
              {fieldErrors.displayName && (
                <div className="absolute -top-10 left-0 bg-[#EF4444] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 z-10">
                  <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#EF4444] rotate-45" />
                </div>
              )}
            </div>
          </div>
        )}
        <div>
          <label className="block mb-2 text-sm text-gray-500 font-medium">{t('authScreen.email')}</label>
          <div className="relative">
            <input 
              type="email" value={email} 
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: false})) }} 
              placeholder="focus@example.com" 
              className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors`}
            />
            {fieldErrors.email && (
              <div className="absolute -top-10 left-0 bg-[#EF4444] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 z-10">
                <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#EF4444] rotate-45" />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-500 font-medium">{t('authScreen.password')}</label>
          <div className="relative">
            <input 
              type="password" value={password} 
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: false})) }} 
              placeholder="••••••••" minLength="6" 
              className={`w-full bg-white/5 border ${fieldErrors.password ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none transition-colors`}
            />
            {fieldErrors.password && (
              <div className="absolute -top-10 left-0 bg-[#EF4444] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 z-10">
                <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#EF4444] rotate-45" />
              </div>
            )}
          </div>
          
          {!isRegister && (
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={handleResetPassword}
                disabled={loading}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {t('authScreen.forgotPassword')}
              </button>
            </div>
          )}
        </div>

        <motion.button 
          type="submit" disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 bg-focus-primary text-white font-bold py-4 px-6 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all flex justify-center items-center gap-2"
        >
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading ? t('authScreen.processing') : (isRegister ? t('authScreen.createAccount') : t('authScreen.login'))}
        </motion.button>
      </form>

      <div className="text-center mt-8">
        <button 
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? t('authScreen.hasAccount') : t('authScreen.noAccount')}
        </button>
      </div>
    </motion.div>
  );
}

export default AuthScreen;
