import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../App';

export default function SkillTest() {
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState([]);
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    api.get('skill-test/questions').then((q) => {
      if (Array.isArray(q)) {
        setQuestions(q);
        setAnswers(new Array(q.length).fill(null));
      }
    });
  }, []);

  const select = (qi, oi) =>
    setAnswers((prev) => { const n = [...prev]; n[qi] = oi; return n; });

  const submit = async () => {
    if (answers.includes(null)) return setErr('Please answer all questions before submitting.');
    setErr('');
    setLoading(true);
    const res = await api.post('skill-test', { answers });
    setLoading(false);
    if (res.error) return setErr(res.error);
    setResult(res);
    login({ ...user, trustScore: res.trustScore }, localStorage.getItem('token'));
  };

  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    return (
      <div style={s.page}>
        <div style={s.resultCard}>
          <div style={s.resultIcon}>{pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '📚'}</div>
          <h2 style={{ color: '#f1f5f9', marginBottom: 8 }}>Test Complete!</h2>
          <p style={s.resultSub}>
            You answered {result.correct} out of {result.total} questions correctly ({pct}%)
          </p>

          <div style={s.statsRow}>
            <div style={s.stat}>
              <span style={{ ...s.statVal, color: '#38bdf8' }}>{result.skillScore}</span>
              <span style={s.statLabel}>Skill Points<br /><small>(max 50)</small></span>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <span style={{ ...s.statVal, color: '#a78bfa' }}>{result.trustScore}</span>
              <span style={s.statLabel}>Trust Score<br /><small>(max 100)</small></span>
            </div>
          </div>

          <p style={s.tip}>
            💡 Complete the Sandbox Task to earn +10 more trust points!
          </p>
        </div>
      </div>
    );
  }

  const answered = answers.filter((a) => a !== null).length;

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <div>
          <h2 style={s.title}>🧠 Skill Test</h2>
          <p style={s.sub}>5 questions about freelancing basics · Earn up to 50 trust points</p>
        </div>
        <div style={s.progress}>{answered}/{questions.length} answered</div>
      </div>

      {err && <div style={s.err}>{err}</div>}

      <div style={s.questions}>
        {questions.map((q, qi) => (
          <div key={qi} style={s.qCard}>
            <p style={s.qText}>
              <span style={s.qNum}>{qi + 1}</span> {q.q}
            </p>
            <div style={s.opts}>
              {q.opts.map((o, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <label key={oi} style={{ ...s.opt, ...(selected ? s.optSelected : {}) }}>
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={selected}
                      onChange={() => select(qi, oi)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ ...s.radio, ...(selected ? s.radioSelected : {}) }} />
                    <span style={{ color: selected ? '#f1f5f9' : '#94a3b8' }}>{o}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <button style={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Submitting…' : `Submit Test (${answered}/${questions.length})`}
        </button>
      )}
    </div>
  );
}

const s = {
  page:         { maxWidth: 680, margin: '0 auto', padding: '40px 20px' },
  headerRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:        { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 6 },
  sub:          { color: '#64748b', fontSize: 13 },
  progress:     { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#38bdf8', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
  err:          { background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '12px 16px', color: '#fca5a5', fontSize: 13, marginBottom: 20 },
  questions:    { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 },
  qCard:        { background: '#1e293b', borderRadius: 12, padding: 22, border: '1px solid #334155' },
  qText:        { color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.5, display: 'flex', gap: 12, alignItems: 'flex-start' },
  qNum:         { background: '#0ea5e920', color: '#38bdf8', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  opts:         { display: 'flex', flexDirection: 'column', gap: 10 },
  opt:          { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', transition: 'all 0.15s' },
  optSelected:  { background: '#0ea5e910', borderColor: '#0ea5e9' },
  radio:        { width: 16, height: 16, borderRadius: '50%', border: '2px solid #475569', flexShrink: 0 },
  radioSelected:{ border: '4px solid #0ea5e9', background: '#0f172a' },
  btn:          { padding: '13px 32px', background: '#0ea5e9', border: 'none', color: '#fff', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 700 },
  resultCard:   { background: '#1e293b', borderRadius: 14, padding: 40, border: '1px solid #334155', textAlign: 'center' },
  resultIcon:   { fontSize: 48, marginBottom: 16 },
  resultSub:    { color: '#94a3b8', fontSize: 15, marginBottom: 32 },
  statsRow:     { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, marginBottom: 28, background: '#0f172a', borderRadius: 12, padding: 24 },
  stat:         { textAlign: 'center' },
  statVal:      { display: 'block', fontSize: 36, fontWeight: 800 },
  statLabel:    { color: '#64748b', fontSize: 13, lineHeight: 1.5 },
  statDiv:      { width: 1, height: 60, background: '#334155' },
  tip:          { background: '#0c2540', borderRadius: 8, padding: '12px 16px', color: '#7dd3fc', fontSize: 13 },
};
