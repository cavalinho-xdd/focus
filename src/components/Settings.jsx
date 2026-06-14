import React, { useState } from 'react';
import { Save, Shield, Key, Globe, ChevronDown, Check, Activity, X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

function Settings({ settings, onSave }) {
  const { t, i18n } = useTranslation();
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [blacklistRaw, setBlacklistRaw] = useState((settings.blacklist || []).join('\n'));
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedProcesses, setScannedProcesses] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const procs = await window.api.scanner.getProcesses();
      setScannedProcesses(procs);
      setSelectedProcesses(new Set());
      setSearchQuery('');
      setShowScannerModal(true);
    } catch (e) {
      console.error(e);
    }
    setIsScanning(false);
  };

  const toggleProcess = (proc) => {
    const newSelected = new Set(selectedProcesses);
    if (newSelected.has(proc)) {
      newSelected.delete(proc);
    } else {
      newSelected.add(proc);
    }
    setSelectedProcesses(newSelected);
  };

  const handleApplyScanner = () => {
    const currentList = blacklistRaw.split('\n').map(s => s.trim()).filter(Boolean);
    const toAdd = Array.from(selectedProcesses).filter(p => !currentList.includes(p));
    const newList = [...currentList, ...toAdd];
    setBlacklistRaw(newList.join('\n'));
    setShowScannerModal(false);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('appLang', lang);
    setIsLangOpen(false);
  };

  const handleSave = () => {
    const list = blacklistRaw.split('\n').map(s => s.trim()).filter(Boolean);
    onSave({ apiKey, blacklist: list });
  };

  return (
    <div className="panel" style={{ maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="text-gradient" style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '800' }}>{t('settings.title')}</h2>

      <div className="mb-4">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Globe size={16} className="text-muted" /> {t('settings.language')}
        </label>
        <div style={{ position: 'relative' }}>
          <button 
            type="button"
            className="secondary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px', marginTop: 0, color: 'var(--text-main)', borderRadius: '12px' }}
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            {i18n.language === 'cs' ? t('settings.czech') : t('settings.english')}
            <ChevronDown size={18} className="text-muted" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          
          <AnimatePresence>
            {isLangOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  marginTop: '8px',
                  background: '#13111C', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  zIndex: 50,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              >
                <div 
                  onClick={() => handleLanguageChange('en')}
                  style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: i18n.language === 'en' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = i18n.language === 'en' ? 'rgba(255,255,255,0.05)' : 'transparent'}
                >
                  {t('settings.english')}
                  {i18n.language === 'en' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <div 
                  onClick={() => handleLanguageChange('cs')}
                  style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: i18n.language === 'cs' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = i18n.language === 'cs' ? 'rgba(255,255,255,0.05)' : 'transparent'}
                >
                  {t('settings.czech')}
                  {i18n.language === 'cs' && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mb-4">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Key size={16} className="text-muted" /> {t('settings.apiKey')}
        </label>
        <input 
          type="password" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          placeholder="AIzaSy..." 
        />
        <p style={{ fontSize: '13px' }} className="text-muted">
          {t('settings.keyDisclaimer')}
        </p>
      </div>

      <div className="mb-4" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          <Shield size={16} className="text-muted" /> {t('settings.blacklistLabel')}
        </label>
        <textarea 
          style={{ flexGrow: 1, fontFamily: 'monospace' }}
          value={blacklistRaw}
          onChange={(e) => setBlacklistRaw(e.target.value)}
          placeholder={`steam\ndiscord\nspotify`}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px' }}>
          <p style={{ fontSize: '13px', maxWidth: '60%' }} className="text-muted">
            {t('settings.blacklistDisclaimer')}
          </p>
          <button 
            type="button"
            className="secondary" 
            onClick={handleScan} 
            disabled={isScanning} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', margin: 0 }}
          >
            <Activity size={16} /> {isScanning ? t('settings.scanning') : t('settings.scanApps')}
          </button>
        </div>
      </div>

      <div>
        <button className="primary" onClick={handleSave}>
          <Save size={18} /> {t('settings.saveSettings')}
        </button>
      </div>

      <AnimatePresence>
        {showScannerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#13111C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', boxSizing: 'border-box', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                <h3 style={{ margin: 0 }}>{t('settings.scanTitle')}</h3>
                <button type="button" onClick={() => setShowScannerModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ position: 'relative', marginBottom: '16px', flexShrink: 0 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={i18n.language === 'cs' ? 'Hledat aplikaci...' : 'Search apps...'}
                  style={{ width: '100%', paddingLeft: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              
              <div style={{ overflowY: 'auto', flexGrow: 1, minHeight: 0, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scannedProcesses.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).map(proc => (
                  <label key={proc} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedProcesses.has(proc)} 
                      onChange={() => toggleProcess(proc)} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{proc}</span>
                  </label>
                ))}
                {scannedProcesses.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-muted text-center" style={{ padding: '20px' }}>Nic nenalezeno.</p>
                )}
              </div>

              <button type="button" className="primary" onClick={handleApplyScanner} style={{ width: '100%', flexShrink: 0 }}>
                {t('settings.apply')} ({selectedProcesses.size})
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
