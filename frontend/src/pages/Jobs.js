import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../App';

const CATEGORY_COLORS = {
  'Logo Design':         '#7c3aed',
  'Blog Writing':        '#0891b2',
  'Data Entry':          '#059669',
  'Social Media Posts':  '#d97706',
  'Product Descriptions':'#dc2626',
  'Email Newsletter':    '#0ea5e9',
};

export default function Jobs() {
  const [jobs,    setJobs]    = useState([]);
  const [applied, setApplied] = useState({});
  const [msgs,    setMsgs]    = useState({});
  const [loading, setLoading] = useState({});
  const { user } = useAuth();

  useEffect(() => { api.get('jobs').then(setJobs); }, []);

  const apply = async (jobId) => {
    setLoading((p) => ({ ...p, [jobId]: true }));
    const res = await api.post('apply-job', { jobId });
    setLoading((p) => ({ ...p, [jobId]: false }));

    if (res.error) {
      setMsgs((p) => ({ ...p, [jobId]: { text: res.error, ok: false } }));
    } else {
      setApplied((p) => ({ ...p, [jobId]: true }));
      setMsgs((p) => ({ ...p, [jobId]: { text: '✓ Application submitted!', ok: true } }));
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, applicants: j.applicants + 1 } : j));
    }
  };

  const canApply = user.trustScore >= 30;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>💼 Available Jobs</h2>
          <p style={s.sub}>{jobs.length} beginner-friendly positions</p>
        </div>
        <div style={{ ...s.scorePill, background: canApply ? '#14532d' : '#450a0a', color: canApply ? '#4ade80' : '#f87171', border: `1px solid ${canApply ? '#166534' : '#7f1d1d'}` }}>
          {canApply ? '✓ Eligible to apply' : `Trust ${user.trustScore}/30 needed`}
        </div>
      </div>

      {!canApply && (
        <div style={s.lockBanner}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <p style={{ color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>Job Applications Locked</p>
            <p style={{ color: '#f87171', fontSize: 13 }}>
              Your trust score is {user.trustScore}. Complete the Skill Test and Sandbox Task to reach 30 and unlock applications.
            </p>
          </div>
        </div>
      )}

      <div style={s.grid}>
        {jobs.map((j) => {
          const color     = CATEGORY_COLORS[j.title] || '#0ea5e9';
          const isApplied = applied[j.id];
          const isLoading = loading[j.id];
          const msg       = msgs[j.id];

          return (
            <div key={j.id} style={{ ...s.card, borderTop: `3px solid ${color}` }}>
              <div style={s.cardTop}>
                <span style={{ ...s.catBadge, background: color + '20', color }}>{j.title}</span>
                <span style={s.applicants}>👤 {j.applicants}</span>
              </div>

              <p style={s.desc}>{j.description}</p>

              {msg && (
                <p style={{ color: msg.ok ? '#4ade80' : '#f87171', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
                  {msg.text}
                </p>
              )}

              <button
                style={{
                  ...s.applyBtn,
                  background:    isApplied ? '#1a2e40' : canApply ? color : '#1e293b',
                  color:         isApplied ? '#38bdf8'  : canApply ? '#fff' : '#475569',
                  cursor:        canApply && !isApplied ? 'pointer' : 'default',
                  border:        `1px solid ${isApplied ? '#0369a1' : canApply ? color : '#334155'}`,
                }}
                disabled={!canApply || isApplied || isLoading}
                onClick={() => apply(j.id)}
              >
                {isLoading ? 'Applying…' : isApplied ? '✓ Applied' : 'Apply Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page:       { maxWidth: 820, margin: '0 auto', padding: '40px 20px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:      { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 4 },
  sub:        { color: '#64748b', fontSize: 14 },
  scorePill:  { padding: '8px 16px', borderRadius: 99, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' },
  lockBanner: { display: 'flex', gap: 16, alignItems: 'flex-start', background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 12, padding: '16px 20px', marginBottom: 24 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card:       { background: '#1e293b', borderRadius: 12, padding: 22, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 12 },
  cardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBadge:   { borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 },
  applicants: { color: '#64748b', fontSize: 12 },
  desc:       { color: '#94a3b8', fontSize: 13, lineHeight: 1.6, flexGrow: 1 },
  applyBtn:   { padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, transition: 'opacity 0.15s', marginTop: 4 },
};
