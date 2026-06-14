import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Odpočet, poté spustíme exit animaci a pak odpojíme komponentu
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete(), 1000); // 1s na exit animaci
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="flex-center" 
          style={{ height: '100%', width: '100%', flexDirection: 'column', position: 'fixed', zIndex: 9999, top: 0, left: 0, background: 'var(--bg-color)' }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
      <div style={{ textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            letterSpacing: '-0.03em',
            margin: 0,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.5))'
          }}
        >
          Focus
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 1, ease: 'easeOut' }}
          style={{
            color: 'var(--text-muted)',
            fontSize: '18px',
            marginTop: '16px',
            opacity: 0.6,
            fontStyle: 'italic',
            letterSpacing: '0.05em'
          }}
        >
          Where attention goes, energy flows
        </motion.p>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
