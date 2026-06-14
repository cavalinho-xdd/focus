import React from 'react';
import { Target, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', bounce: 0.4 } }
};

function Dashboard({ stats }) {
  const { t } = useTranslation();
  const progressPercent = (stats.xp / (stats.level * 100)) * 100;

  return (
    <div className="mb-4">
      <h3 className="mb-4 text-muted">{t('dashboard.overview')}</h3>
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div className="panel mb-4" variants={itemVariants} style={{ padding: '32px' }}>
          
          <h2 className="text-gradient" style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '800' }}>{t('dashboard.title')}</h2>
          
          <div className="card-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
            
            <div className="card" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '20px', borderRadius: '16px', minWidth: '150px' }}>
              <p className="text-muted" style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.level')}</p>
              <div style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1 }} className="text-gradient">
                {stats.level}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="text-muted" style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('dashboard.xp')}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{progressPercent.toFixed(0)}%</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', lineHeight: '1' }}>{stats.xp}</div>
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), var(--cta))',
                  boxShadow: '0 0 10px var(--primary)',
                  transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}></div>
              </div>
            </div>

            <div style={{ minWidth: '120px', textAlign: 'right' }}>
              <div className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>{t('dashboard.completedGoals')}</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1' }}>{stats.goalsCompleted}</div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
