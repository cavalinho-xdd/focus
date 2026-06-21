import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, where } from 'firebase/firestore';
import { Trophy, Users, Search, Plus, X, Clock, Flame, Target, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

function SocialScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('GLOBAL');
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const formatTime = (minutes) => {
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchError, setSearchError] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    loadLeaderboards();
  }, [tab]);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      if (tab === 'GLOBAL') {
        const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGlobalLeaderboard(data);
      } else if (tab === 'FRIENDS' || tab === 'REQUESTS') {
        const myDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const myData = myDoc.exists() ? myDoc.data() : {};
        const friendIds = myData.friends || [];
        const ignoredIds = myData.ignoredRequests || [];
        
        if (tab === 'FRIENDS') {
          const qMe = query(collection(db, "users"), where("friends", "array-contains", auth.currentUser.uid));
          const snapMe = await getDocs(qMe);
          const peopleWhoFriendedMe = snapMe.docs.map(d => d.id);
          
          const allFriendIds = [...new Set([...friendIds, ...peopleWhoFriendedMe])];
          
          if (allFriendIds.length === 0) {
            setFriendsLeaderboard([ { id: auth.currentUser.uid, ...myData } ]); 
          } else {
            const idsToFetch = [...new Set([auth.currentUser.uid, ...allFriendIds])];
            const docs = await Promise.all(idsToFetch.map(id => getDoc(doc(db, "users", id))));
            const friendsData = docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }));
            friendsData.sort((a, b) => (b.xp || 0) - (a.xp || 0));
            setFriendsLeaderboard(friendsData);
          }
        } else if (tab === 'REQUESTS') {
          const q = query(collection(db, "users"), where("outgoingRequests", "array-contains", auth.currentUser.uid));
          const snap = await getDocs(q);
          const pending = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const filtered = pending.filter(u => !ignoredIds.includes(u.id) && !friendIds.includes(u.id));
          setRequestsList(filtered);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) {
      setSearchError(true);
      return;
    }
    setSearchError(false);
    setLoading(true);
    setFriendStatus(null);
    try {
      const q = query(collection(db, "users"), where("displayNameLower", "==", searchName.trim().toLowerCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const found = snap.docs[0];
        if (found.id !== auth.currentUser.uid) {
          setSearchResult({ id: found.id, ...found.data() });
        } else {
          setSearchResult('NOT_FOUND');
        }
      } else {
        setSearchResult('NOT_FOUND');
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddFriend = async (friendId) => {
    try {
      const myRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(myRef, {
        outgoingRequests: arrayUnion(friendId)
      });
      setFriendStatus('SUCCESS');
      setSearchResult(null);
      setTimeout(() => setFriendStatus(null), 3000);
    } catch(e) {
      console.error(e);
      setFriendStatus('ERROR');
      setTimeout(() => setFriendStatus(null), 3000);
    }
  };

  const handleApproveRequest = async (friendId) => {
    try {
      const myRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(myRef, {
        friends: arrayUnion(friendId)
      });
      setRequestsList(prev => prev.filter(u => u.id !== friendId));
    } catch(e) {
      console.error(e);
    }
  };

  const handleDenyRequest = async (friendId) => {
    try {
      const myRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(myRef, {
        ignoredRequests: arrayUnion(friendId)
      });
      setRequestsList(prev => prev.filter(u => u.id !== friendId));
    } catch(e) {
      console.error(e);
    }
  };

  const renderTable = (data) => (
    <div className="mt-8 flex flex-col">
      {data.map((user, i) => (
        <div key={user.id} className="relative group border-b border-white/5 last:border-0">
          {/* Beautiful detached hover pill inside the row */}
          <div className="absolute inset-1 bg-white/[0.06] rounded-2xl opacity-0 group-hover:opacity-100 transition duration-200 ease-ui-out pointer-events-none scale-[0.98] group-hover:scale-100 shadow-lg" />
          
          {/* Row Content */}
          <div 
            onClick={() => setSelectedUser(user)}
            className="relative flex justify-between items-center py-4 px-5 cursor-pointer z-10"
          >
            <div className="flex items-center gap-5">
              <span className={`w-6 text-center text-sm font-bold ${i < 3 ? 'text-focus-secondary' : 'text-gray-600'}`}>{i + 1}</span>
              <div className={`flex items-center gap-2 font-medium ${user.id === auth.currentUser.uid ? 'text-white' : 'text-gray-400'}`}>
                <span>{user.displayName || t('socialScreen.anonymous')}</span>
                {(user.role === 'dev' || user.role === 'admin') && (
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-focus-primary bg-focus-primary/15 px-2 py-0.5 rounded-md" title="Aurora Developer">
                    <BadgeCheck size={12} /> DEV
                  </div>
                )}
                {user.id === auth.currentUser.uid && <span className="text-gray-600 text-xs ml-1">{t('socialScreen.you')}</span>}
              </div>
            </div>
            <div className="text-right flex items-center gap-6">

            {user.streak > 0 && (
              <div className="flex items-center gap-1.5 opacity-80" title={`${user.streak} day streak`}>
                <Flame size={14} className="text-focus-primary" />
                <span className="text-white font-bold text-xs font-mono">{user.streak}</span>
              </div>
            )}
              <span className="text-white font-bold text-sm font-mono">{t('app.level')} {user.level}</span>
              <span className="text-focus-primary text-xs font-medium w-16 text-right font-mono">{user.xp} XP</span>
            </div>
          </div>
        </div>
      ))}
      {data.length === 0 && !loading && <div className="py-12 text-center text-gray-600">{t('socialScreen.empty')}</div>}
    </div>
  );

  const renderRequests = (data) => (
    <div className="mt-8">
      {data.map((user) => (
        <div key={user.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
          <span className="font-medium text-white">{user.displayName || t('socialScreen.anonymous')}</span>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-full bg-focus-primary text-white text-xs font-bold transition-colors hover:bg-focus-secondary" 
              onClick={() => handleApproveRequest(user.id)}
            >
              {t('socialScreen.approve')}
            </button>
            <button 
              className="px-4 py-2 rounded-full bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition-colors" 
              onClick={() => handleDenyRequest(user.id)}
            >
              {t('socialScreen.deny')}
            </button>
          </div>
        </div>
      ))}
      {data.length === 0 && !loading && <div className="py-12 text-center text-gray-600">{t('socialScreen.noRequests')}</div>}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header — flat, like web section headings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 flex items-center gap-4">
          <Trophy size={28} className="text-focus-primary" /> {t('socialScreen.communityTitle')}
        </h1>
        <p className="text-gray-500 font-light text-lg mb-8">{t('socialScreen.subtitle')}</p>
      </motion.div>
      
      {/* Tab pills */}
      <div className="flex gap-2 mb-2">
        {[
          { id: 'GLOBAL', label: t('socialScreen.globalTop20') },
          { id: 'FRIENDS', label: t('socialScreen.friends'), icon: Users },
          { id: 'REQUESTS', label: t('socialScreen.requests') },
          { id: 'ADD', label: t('socialScreen.add'), icon: Plus },
        ].map(item => (
          <button 
            key={item.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ease-ui-out active:scale-95 border ${
              tab === item.id 
                ? 'bg-white/10 text-white border-white/15' 
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
            }`} 
            onClick={() => setTab(item.id)}
          >
            <span className="flex items-center gap-2">
              {item.icon && <item.icon size={14} />}
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-focus-primary border-t-transparent animate-spin" />
          </div>
        )}
        
        {!loading && tab === 'GLOBAL' && renderTable(globalLeaderboard)}
        {!loading && tab === 'FRIENDS' && renderTable(friendsLeaderboard)}
        {!loading && tab === 'REQUESTS' && renderRequests(requestsList)}
        
        {!loading && tab === 'ADD' && (
          <div className="mt-8 max-w-lg">
            <p className="text-gray-500 mb-4 text-sm font-light">{t('socialScreen.addFriendInstruction')}</p>
            <form noValidate onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={searchName} 
                  onChange={(e) => { setSearchName(e.target.value); setSearchError(false); }} 
                  placeholder={t('socialScreen.friendEmailPlaceholder')} 
                  className={`w-full bg-white/5 border ${searchError ? 'border-red-500' : 'border-white/10 focus:border-focus-primary/50'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors`}
                />
                <AnimatePresence>
                  {searchError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      className="absolute -top-12 left-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 z-[var(--z-tooltip)] whitespace-nowrap"
                    >
                      <AlertCircle size={12} /> {t('goalPlanner.requiredField')}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#EF4444] rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                type="submit" 
                aria-label="Search"
                className="bg-focus-primary hover:bg-focus-secondary text-white px-5 rounded-full transition-colors flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            </form>

            {friendStatus === 'SUCCESS' && (
              <div className="text-green-400 text-sm mt-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> {t('socialScreen.inviteSent')}
              </div>
            )}
            {friendStatus === 'ERROR' && (
              <div className="text-red-400 text-sm mt-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {t('socialScreen.addError')}
              </div>
            )}

            {searchResult === 'NOT_FOUND' && <div className="mt-6 text-gray-600">{t('socialScreen.userNotFound')}</div>}
            
            {searchResult && searchResult !== 'NOT_FOUND' && (
              <div className="mt-6 py-4 flex justify-between items-center border-b border-white/5">
                <div>
                  <div className="font-bold text-white">{searchResult.displayName}</div>
                  <div className="text-xs text-focus-primary font-medium mt-1">{t('app.level')} {searchResult.level}</div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-focus-primary text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2" 
                  onClick={() => handleAddFriend(searchResult.id)}
                >
                  <Plus size={14} /> {t('socialScreen.add')}
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedUser && (() => {
            const xpProgress = Math.min(((selectedUser.xp || 0) / ((selectedUser.level || 1) * 100)) * 100, 100);
            const initial = (selectedUser.displayName || 'A').charAt(0).toUpperCase();
            const isSelf = selectedUser.id === auth.currentUser?.uid;
            const isDev = selectedUser.role === 'dev' || selectedUser.role === 'admin';
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={() => setSelectedUser(null)}
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ scale: 0.92, opacity: 0, y: 16, filter: 'blur(8px)' }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onClick={e => e.stopPropagation()}
                  className="bg-focus-bg/98 border border-white/10 rounded-3xl max-w-sm w-full relative shadow-2xl overflow-hidden"
                >
                  {/* Ambient top glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-focus-primary/40 to-transparent" />

                  <div className="p-8">
                    <button
                      onClick={() => setSelectedUser(null)}
                      aria-label="Close user profile"
                      className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    >
                      <X size={18} />
                    </button>

                    {/* Identity */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-full bg-focus-primary/20 border-2 border-focus-primary/35 flex items-center justify-center">
                          <span className="text-2xl font-black text-focus-primary font-mono">{initial}</span>
                        </div>
                        {isSelf && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-focus-primary border-2 border-focus-bg" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white leading-none truncate">
                            {selectedUser.displayName || t('socialScreen.anonymous')}
                          </h3>
                          {isDev && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-focus-primary bg-focus-primary/12 border border-focus-primary/20 px-2 py-0.5 rounded-md shrink-0">
                              <BadgeCheck size={11} /> DEV
                            </div>
                          )}
                        </div>
                        {isSelf && (
                          <span className="text-xs text-gray-600 mt-0.5 block">that's you</span>
                        )}
                      </div>
                    </div>

                    {/* Level + XP — primary stat, not a grid */}
                    <div className="mb-5">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-3xl font-black text-white font-mono leading-none">
                          Lv.{selectedUser.level || 1}
                        </span>
                        <span className="text-xs text-gray-600 font-mono tabular-nums">
                          {selectedUser.xp || 0} / {(selectedUser.level || 1) * 100} XP
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-focus-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>

                    {/* Secondary stats — two chips, not four columns */}
                    <div className="flex items-center gap-2.5 pt-5 border-t border-white/5">
                      {(selectedUser.streak || 0) > 0 && (
                        <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 rounded-full px-3 py-1.5">
                          <Flame size={13} className="text-focus-primary shrink-0" />
                          <span className="text-sm font-bold text-white font-mono">{selectedUser.streak}</span>
                          <span className="text-xs text-gray-500">streak</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 rounded-full px-3 py-1.5">
                        <Target size={13} className="text-gray-500 shrink-0" />
                        <span className="text-sm font-bold text-white font-mono">{selectedUser.goalsCompleted || 0}</span>
                        <span className="text-xs text-gray-500">sessions</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 rounded-full px-3 py-1.5 ml-auto">
                        <Clock size={13} className="text-gray-500 shrink-0" />
                        <span className="text-sm font-bold text-white font-mono">{formatTime(selectedUser.totalFocusMinutes)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>, document.body)}
    </div>
  );
}

export default SocialScreen;
