import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, where } from 'firebase/firestore';
import { Trophy, Users, Search, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function SocialScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('GLOBAL'); // GLOBAL, FRIENDS, ADD
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
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
        // Nejprve nacteme vlastni profil abychom zjistili seznam pratel
        const myDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (myDoc.exists()) {
          const myData = myDoc.data();
          const friendIds = myData.friends || [];
          const requestIds = myData.friendRequests || [];
          
          if (tab === 'FRIENDS') {
            if (friendIds.length === 0) {
              setFriendsLeaderboard([ { id: auth.currentUser.uid, ...myData } ]); // Jen já
            } else {
              const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
              const snap = await getDocs(q);
              const allData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              const filtered = allData.filter(u => friendIds.includes(u.id) || u.id === auth.currentUser.uid);
              setFriendsLeaderboard(filtered);
            }
          } else if (tab === 'REQUESTS') {
            if (requestIds.length === 0) {
              setRequestsList([]);
            } else {
              const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
              const snap = await getDocs(q);
              const allData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              const filtered = allData.filter(u => requestIds.includes(u.id));
              setRequestsList(filtered);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName) return;
    setLoading(true);
    setFriendStatus(null);
    try {
      const q = query(collection(db, "users"), where("displayName", "==", searchName));
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
      const friendRef = doc(db, "users", friendId);
      await updateDoc(friendRef, {
        friendRequests: arrayUnion(auth.currentUser.uid)
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
      const friendRef = doc(db, "users", friendId);
      await updateDoc(myRef, {
        friends: arrayUnion(friendId),
        friendRequests: arrayRemove(friendId)
      });
      await updateDoc(friendRef, {
        friends: arrayUnion(auth.currentUser.uid)
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
        friendRequests: arrayRemove(friendId)
      });
      setRequestsList(prev => prev.filter(u => u.id !== friendId));
    } catch(e) {
      console.error(e);
    }
  };

  const renderTable = (data) => (
    <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px' }}>
      {data.map((user, i) => (
        <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', width: '20px', color: i < 3 ? 'var(--secondary)' : 'var(--text-muted)' }}>{i + 1}.</span>
            <span style={{ fontWeight: user.id === auth.currentUser.uid ? 'bold' : 'normal', color: user.id === auth.currentUser.uid ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {user.displayName || t('socialScreen.anonymous')} {user.id === auth.currentUser.uid && t('socialScreen.you')}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>Lvl {user.level}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.xp} XP</div>
          </div>
        </div>
      ))}
      {data.length === 0 && !loading && <div style={{ padding: '20px', textAlign: 'center' }}>{t('socialScreen.empty')}</div>}
    </div>
  );

  const renderRequests = (data) => (
    <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px' }}>
      {data.map((user, i) => (
        <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>
              {user.displayName || t('socialScreen.anonymous')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="cta" onClick={() => handleApproveRequest(user.id)} style={{ padding: '6px 12px', fontSize: '14px' }}>{t('socialScreen.approve')}</button>
            <button className="secondary" onClick={() => handleDenyRequest(user.id)} style={{ padding: '6px 12px', fontSize: '14px' }}>{t('socialScreen.deny')}</button>
          </div>
        </div>
      ))}
      {data.length === 0 && !loading && <div style={{ padding: '20px', textAlign: 'center' }}>{t('socialScreen.noRequests')}</div>}
    </div>
  );

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={20} /> {t('socialScreen.communityTitle')}</h3>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button className={tab === 'GLOBAL' ? 'primary' : 'secondary'} onClick={() => setTab('GLOBAL')}>
          {t('socialScreen.globalTop20')}
        </button>
        <button className={tab === 'FRIENDS' ? 'primary' : 'secondary'} onClick={() => setTab('FRIENDS')}>
          <Users size={16} /> {t('socialScreen.friends')}
        </button>
        <button className={tab === 'REQUESTS' ? 'primary' : 'secondary'} onClick={() => setTab('REQUESTS')}>
          <Users size={16} /> {t('socialScreen.requests')}
        </button>
        <button className={tab === 'ADD' ? 'primary' : 'secondary'} onClick={() => setTab('ADD')}>
          <Plus size={16} /> {t('socialScreen.add')}
        </button>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading && <div className="flex-center" style={{ height: '100px' }}>{t('socialScreen.loading')}</div>}
        
        {!loading && tab === 'GLOBAL' && renderTable(globalLeaderboard)}
        {!loading && tab === 'FRIENDS' && renderTable(friendsLeaderboard)}
        {!loading && tab === 'REQUESTS' && renderRequests(requestsList)}
        
        {!loading && tab === 'ADD' && (
          <div style={{ marginTop: '16px' }}>
            <p className="text-muted mb-4" style={{ fontSize: '14px' }}>{t('socialScreen.addFriendInstruction')}</p>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder={t('socialScreen.friendEmailPlaceholder')} style={{ marginBottom: 0 }} required />
              <button type="submit" className="primary"><Search size={18} /></button>
            </form>

            {friendStatus === 'SUCCESS' && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '12px', borderRadius: '12px', marginTop: '16px', fontSize: '14px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                {t('socialScreen.inviteSent')}
              </div>
            )}
            {friendStatus === 'ERROR' && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', padding: '12px', borderRadius: '12px', marginTop: '16px', fontSize: '14px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                {t('socialScreen.addError')}
              </div>
            )}

            {searchResult === 'NOT_FOUND' && <div className="mt-4 text-muted">{t('socialScreen.userNotFound')}</div>}
            
            {searchResult && searchResult !== 'NOT_FOUND' && (
              <div className="mt-4 p-4 panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{searchResult.displayName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lvl {searchResult.level}</div>
                </div>
                <button className="cta" onClick={() => handleAddFriend(searchResult.id)} style={{ padding: '8px 12px' }}>
                  <Plus size={16} /> {t('socialScreen.add')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialScreen;
