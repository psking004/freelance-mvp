import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../App';

export default function Task() {
  const [task,    setTask]    = useState(null);
  const [output,  setOutput]  = useState('');
  const [result,  setResult]  = useState(null);
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const MIN_CHARS = 20;

  useEffect(() => { api.get('task').then(setTask); }, []);

  const submit = async () => {
    if (output.trim().length < MIN_CHARS) {
      return setErr(`Response too short — write at least ${MIN_CHARS} characters.`);
    }
    setErr('');
    setLoading(true);
    const res = await api.post('task-submit', { taskOutput: output });
    setLoading(false);
    if (res.error) return setErr(res.error);
    setResult(res);
    login({ ...user, trustScore: res.trustScore }, localStorage.getItem('token'));
  };

  if (result) return (
    <div style={s.page}>
      <div style={s.resultCard}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: '#34d399', marginBottom: 8 }}>Task Accepted!</h2>
        <p style={s.resultSub}>{result.message}</p>
        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={{ ...s.statVal, color: '#38bdf8' }}>{result.tasksCompleted}</span>
            <span style={s.statLabel}>Tasks Completed</span>
          </div>
          <div style={s.statDiv} />
          <div style={s.stat}>
            <span style={{ ...s.statVal, color: '#a78bfa' }}>{result.trustScore}</span>
            <span style={s.statLabel}>New Trust Score</span>
          </div>
        </div>
        <p style={s.tip}>
          💡 You can submit the task again to earn more trust points (up to 30 from tasks total).
        </p>
      </div>
    </div>
  );

  const charCount = output.trim().length;
  const ready = charCount >= MIN_CHARS;

  return (
    <div style={s.page}>
      <h2 style={s.title}>📝 Sandbox Task</h2>
      <p style={s.sub}>Complete this real-world task to earn trust points</p>

      {task && (
        <>
          <div style={s.taskCard}>
            <div style={s.taskHeader}>
              <span style={s.taskBadge}>Task</span>
              <h3 style={s.taskTitle}>{task.title}</h3>
            </div>
            <p style={s.taskDesc}>{task.description}</p>
            <div style={s.rewardRow}>
              <span style={s.reward}>⭐ +10 trust points on submission</span>
            </div>
          </div>

          <div style={s.editorSection}>
            <div style={s.editorHeader}>
              <label style={s.editorLabel}>Your Submission</label>
              <span style={{ ...s.charCount, color: ready ? '#34d399' : '#94a3b8' }}>
                {charCount} chars {ready ? '✓' : `(min ${MIN_CHARS})`}
              </span>
            </div>
            {err && <div style={s.err}>{err}</div>}
            <textarea
              style={s.textarea}
              placeholder="Write your proposal here. Be concise, professional, and address all three points in the task description..."
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
            <button
              style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit Task'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  page:         { maxWidth: 680, margin: '0 auto', padding: '40px 20px' },
  title:        { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 6 },
  sub:          { color: '#64748b', fontSize: 14, marginBottom: 28 },
  taskCard:     { background: '#1e293b', borderRadius: 14, padding: 28, marginBottom: 24, border: '1px solid #334155', borderLeft: '4px solid #0ea5e9' },
  taskHeader:   { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  taskBadge:    { background: '#0ea5e920', color: '#38bdf8', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  taskTitle:    { color: '#f1f5f9', fontSize: 17, fontWeight: 700 },
  taskDesc:     { color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 16 },
  rewardRow:    { borderTop: '1px solid #334155', paddingTop: 14 },
  reward:       { color: '#fbbf24', fontSize: 13, fontWeight: 600 },
  editorSection:{ display: 'flex', flexDirection: 'column', gap: 12 },
  editorHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editorLabel:  { color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' },
  charCount:    { fontSize: 12, fontWeight: 600 },
  err:          { background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 },
  textarea:     { width: '100%', minHeight: 180, padding: 16, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box' },
  btn:          { padding: '13px 28px', background: '#0ea5e9', border: 'none', color: '#fff', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' },
  resultCard:   { background: '#1e293b', borderRadius: 14, padding: 40, border: '1px solid #334155', textAlign: 'center' },
  resultSub:    { color: '#94a3b8', fontSize: 15, marginBottom: 28 },
  statsRow:     { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, marginBottom: 24, background: '#0f172a', borderRadius: 12, padding: 24 },
  stat:         { textAlign: 'center' },
  statVal:      { display: 'block', fontSize: 36, fontWeight: 800 },
  statLabel:    { color: '#64748b', fontSize: 13 },
  statDiv:      { width: 1, height: 60, background: '#334155' },
  tip:          { background: '#0c2540', borderRadius: 8, padding: '12px 16px', color: '#7dd3fc', fontSize: 13 },
};
