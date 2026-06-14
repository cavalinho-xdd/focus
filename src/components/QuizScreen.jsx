import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function QuizScreen({ quizData, apiKey, onSubmit }) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  if (!quizData || quizData.length === 0) {
    return (
      <div className="glass-panel flex-center" style={{ flexDirection: 'column' }}>
        <h3 className="mb-4">{t('quizScreen.notAvailable')}</h3>
        <p className="text-muted" style={{ marginBottom: '24px' }}>{t('quizScreen.failedToGenerate')}</p>
        <button className="primary" onClick={() => onSubmit(0, t('quizScreen.notAvailable'))}>{t('quizScreen.continue')}</button>
      </div>
    );
  }

  const handleTextChange = (id, text) => {
    setAnswers(prev => ({ ...prev, [id]: text }));
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    const pairs = quizData.map(q => ({
      question: q.question,
      hint: q.hint,
      answer: answers[q.id] || t('quizScreen.dontKnow')
    }));

    if (window.api && window.api.gemini && apiKey) {
      const res = await window.api.gemini.evaluate(pairs, apiKey);
      if (res.evaluation) {
        setEvaluationResult(res.evaluation);
      } else {
        setEvaluationResult({ score: 0, feedback: t('quizScreen.apiError') });
      }
    } else {
      setEvaluationResult({ score: 5, feedback: t('quizScreen.fallbackApi') });
    }
    setIsEvaluating(false);
  };

  if (evaluationResult) {
    return (
      <div className="glass-panel flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--secondary)', marginBottom: '24px', filter: 'drop-shadow(0 0 15px rgba(167, 139, 250, 0.5))' }} />
        <h2 style={{ marginBottom: '16px' }}>{t('quizScreen.evaluation')}</h2>
        <div style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '-0.05em' }}>
          {evaluationResult.score} <span className="text-muted" style={{ fontSize: '32px' }}>/ 10</span>
        </div>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '400px' }} className="text-muted">
          {evaluationResult.feedback}
        </p>
        <button className="cta" onClick={() => onSubmit(evaluationResult.score, evaluationResult.feedback)}>
          {t('quizScreen.claimXp')}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ maxHeight: '100%', overflowY: 'auto' }}>
      <h3 className="mb-4 text-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {t('quizScreen.knowledgeCheckTitle')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
        {quizData.map((q, index) => (
          <div key={q.id}>
            <p style={{ fontWeight: '600', marginBottom: '12px', fontSize: '15px' }}>
              <span className="text-muted">{index + 1}.</span> {q.question}
            </p>
            <textarea 
              placeholder={t('quizScreen.yourAnswer')}
              value={answers[q.id] || ''}
              onChange={(e) => handleTextChange(q.id, e.target.value)}
              rows="3"
            />
          </div>
        ))}
      </div>
      
      <button 
        className="cta" 
        onClick={handleSubmit} 
        disabled={isEvaluating}
        style={{ width: '100%', padding: '14px' }}
      >
        <Send size={18} />
        {isEvaluating ? t('quizScreen.evaluating') : t('quizScreen.submit')}
      </button>
    </div>
  );
}

export default QuizScreen;
