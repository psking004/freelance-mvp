import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

const CARDS = [
  { to: '/skill-test', icon: '🧠', label: 'Skill Test',    desc: 'Earn up to 50 trust points',   color: '#7c3aed' },
  { to: '/task',       icon: '📝', label: 'Sandbox Task',  desc: '+10 trust per submission',      color: '#0891b2' },
  { to: '/jobs',       icon: '💼', label: 'Browse Jobs',   desc: 'Need trust score ≥ 30 to apply', color: '#059669' },
  { to: '/profile',   icon: '👤', label: 'My Profile',    desc: 'Track your progress',           color: '#d97706' },
];

const BREAKDOWN = [
  { label: 'Skill Test',    max: 50, color: '#7c3aed', tip: 'Take the skill test' },
  { label: 'Tasks Done',    max: 30, color: '#0891b2', tip: 'Complete sandbox tasks (+10 each)' },
  { label: 'Active Bonus',  max: 20, color: '#059669', tip: 'Bonus for being an active member' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const pct = Math.min(user.trustScore, 100);

  const getTrustLabel = (score) => {
    if (score >= 80) return { text: 'Expert',     color: '#34d399' };
    if (score >= 60) return { text: 'Advanced',   color: '#38bdf8' };
    if (score >= 40) return { text: 'Intermediate', color: '#a78bfa' };
    if (score >= 30) return { text: 'Ready',       color: '#fbbf24' };
    return             { text: 'Beginner',    color: '#f87171' };
  };
  const badge = getTrustLabel(user.trustScore);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.greeting}>Hello, {user.name} 👋</h2>
          <p style={s.sub}>Here's your freelancer progress overview</p>
        </div>
        <div style={{ ...s.badge, background: badge.color + '20', color: badge.color, border: `1px solid ${badge.color}40` }}>
          {badge.text}
        </div>
      </div>

      {/* Trust Score Bar */}
      <div style={s.scoreCard}>
        <div style={s.scoreRow}>
          <span style={s.scoreLabel}>Trust Score</span>
          <span style={s.scoreValue}>{user.trustScore} <span style={s.scoreMax}>/ 100</span></span>
        </div>
        <div style={s.barTrack}>
          <div style={{ ...s.barFill, width: `${pct}%` }} />
        </div>
        <div style={s.breakdownRow}>
          {BREAKDOWN.map((b) => (
            <div key={b.label} style={s.breakdownItem} title={b.tip}>
              <div style={{ ...s.dot, background: b.color }} />
              <span style={s.breakdownLabel}>{b.label}</span>
              <span style={{ ...s.breakdownMax, color: b.color }}>+{b.max}</span>
            </div>
          ))}
        </div>
        {user.trustScore < 30 && (
          <div style={s.warn}>
            ⚠️ Complete the Skill Test and one Sandbox Task to unlock job applications.
          </div>
        )}
      </div>

      {/* Nav Cards */}
      <div style={s.grid}>
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} style={s.cardLink}>
            <div style={{ ...s.card, borderTop: `3px solid ${c.color}` }}>
              <span style={s.icon}>{c.icon}</span>
              <h4 style={s.cardTitle}>{c.label}</h4>
              <p style={s.cardDesc}>{c.desc}</p>
              <span style={{ ...s.goBtn, color: c.color }}>Go →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const s = {
  page:          { maxWidth: 780, margin: '0 auto', padding: '40px 20px' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting:      { color: '#f1f5f9', fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub:           { color: '#64748b', fontSize: 14 },
  badge:         { padding: '6px 14px', borderRadius: 99, fontWeight: 700, fontSize: 13 },
  scoreCard:     { background: '#1e293b', borderRadius: 14, padding: '24px 28px', marginBottom: 28, border: '1px solid #334155' },
  scoreRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  scoreLabel:    { color: '#94a3b8', fontSize: 14, fontWeight: 600 },
  scoreValue:    { color: '#38bdf8', fontSize: 28, fontWeight: 800 },
  scoreMax:      { color: '#475569', fontSize: 16, fontWeight: 400 },
  barTrack:      { background: '#0f172a', borderRadius: 99, height: 12, marginBottom: 18 },
  barFill:       { background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: 99, height: 12, transition: 'width 0.5s ease' },
  breakdownRow:  { display: 'flex', gap: 24 },
  breakdownItem: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' },
  dot:           { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  breakdownLabel:{ color: '#64748b', fontSize: 12 },
  breakdownMax:  { fontSize: 12, fontWeight: 700 },
  warn:          { marginTop: 16, padding: '10px 14px', background: '#431407', borderRadius: 8, color: '#fdba74', fontSize: 13, border: '1px solid #7c2d12' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 },
  cardLink:      { textDecoration: 'none' },
  card:          { background: '#1e293b', borderRadius: 12, padding: 22, border: '1px solid #334155', height: '100%', transition: 'transform 0.15s, border-color 0.15s', cursor: 'pointer' },
  icon:          { fontSize: 28 },
  cardTitle:     { color: '#f1f5f9', fontSize: 15, fontWeight: 700, margin: '12px 0 6px' },
  cardDesc:      { color: '#64748b', fontSize: 12, lineHeight: 1.5, marginBottom: 14 },
  goBtn:         { fontSize: 13, fontWeight: 700 },
};
