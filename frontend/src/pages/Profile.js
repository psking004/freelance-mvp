import React, { useEffect, useState } from 'react';
import { api } from '../api';

const STATUS = {
  pending:  { label: 'Pending',  color: '#fbbf24', bg: '#431407' },
  accepted: { label: 'Accepted', color: '#4ade80', bg: '#14532d' },
  rejected: { label: 'Rejected', color: '#f87171', bg: '#450a0a' },
};

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => { api.get('profile').then(setProfile); }, []);

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#64748b' }}>Loading profile…</p>
      </div>
    );
  }

  const { name, email, trustScore, skillScore, tasksCompleted, trustBreakdown, applications } = profile;
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const pct      = Math.min(trustScore, 100);

  const BREAKDOWN_ITEMS = [
    { label: 'Skill Test Score',   value: trustBreakdown.fromSkill,   max: 50, color: '#7c3aed', icon: '🧠' },
    { label: 'Task Completion',    value: trustBreakdown.fromTasks,    max: 30, color: '#0891b2', icon: '📝' },
    { label: 'Active Member Bonus',value: trustBreakdown.activeBonus,  max: 20, color: '#059669', icon: '✅' },
  ];

  return (
    <div style={s.page}>
      {/* Profile Header */}
      <div style={s.profileHeader}>
        <div style={s.avatar}>{initials}</div>
        <div>
          <h2 style={s.name}>{name}</h2>
          <p style={s.email}>{email}</p>
          <span style={s.memberBadge}>Active Member</span>
        </div>
      </div>

      {/* Trust Score */}
      <div style={s.section}>
        <div style={s.sectionRow}>
          <h3 style={s.sectionTitle}>Trust Score</h3>
          <span style={s.bigScore}>{trustScore}<span style={s.bigScoreMax}>/100</span></span>
        </div>
        <div style={s.barTrack}>
          <div style={{ ...s.barFill, width: `${pct}%` }} />
        </div>

        <div style={s.breakdown}>
          {BREAKDOWN_ITEMS.map((item) => (
            <div key={item.label} style={s.breakItem}>
              <div style={s.breakLeft}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <p style={s.breakLabel}>{item.label}</p>
                  <div style={s.miniBar}>
                    <div style={{
                      ...s.miniBarFill,
                      width:      `${(item.value / item.max) * 100}%`,
                      background: item.color,
                    }} />
                  </div>
                </div>
              </div>
              <span style={{ ...s.breakVal, color: item.color }}>
                {item.value}<span style={{ color: '#475569', fontWeight: 400 }}>/{item.max}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <span style={s.statIcon}>🧠</span>
          <span style={{ ...s.statNum, color: '#7c3aed' }}>{skillScore}/50</span>
          <span style={s.statLabel}>Skill Score</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statIcon}>📝</span>
          <span style={{ ...s.statNum, color: '#0891b2' }}>{tasksCompleted}</span>
          <span style={s.statLabel}>Tasks Done</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statIcon}>💼</span>
          <span style={{ ...s.statNum, color: '#059669' }}>{applications.length}</span>
          <span style={s.statLabel}>Applications</span>
        </div>
      </div>

      {/* Applications */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>My Applications</h3>
        {applications.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
            <p style={{ color: '#94a3b8' }}>No applications yet.</p>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Apply to jobs once your trust score reaches 30.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {applications.map((a) => {
              const st = STATUS[a.status] || STATUS.pending;
              return (
                <div key={a.id} style={s.appRow}>
                  <span style={s.appTitle}>{a.jobTitle}</span>
                  <span style={{ ...s.statusBadge, color: st.color, background: st.bg, border: `1px solid ${st.color}30` }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:          { maxWidth: 680, margin: '0 auto', padding: '40px 20px' },
  profileHeader: { display: 'flex', gap: 20, alignItems: 'center', marginBottom: 28 },
  avatar:        { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0 },
  name:          { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 4 },
  email:         { color: '#64748b', fontSize: 14, marginBottom: 8 },
  memberBadge:   { background: '#14532d', color: '#4ade80', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #166534' },
  section:       { background: '#1e293b', borderRadius: 14, padding: 24, marginBottom: 20, border: '1px solid #334155' },
  sectionRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { color: '#f1f5f9', fontSize: 16, fontWeight: 700 },
  bigScore:      { color: '#38bdf8', fontSize: 32, fontWeight: 800 },
  bigScoreMax:   { color: '#475569', fontSize: 18, fontWeight: 400 },
  barTrack:      { background: '#0f172a', borderRadius: 99, height: 10, marginBottom: 20 },
  barFill:       { background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: 99, height: 10, transition: 'width 0.5s ease' },
  breakdown:     { display: 'flex', flexDirection: 'column', gap: 14 },
  breakItem:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  breakLeft:     { display: 'flex', gap: 12, alignItems: 'center', flex: 1 },
  breakLabel:    { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  miniBar:       { width: 160, height: 4, background: '#0f172a', borderRadius: 99 },
  miniBarFill:   { height: 4, borderRadius: 99, transition: 'width 0.5s ease' },
  breakVal:      { fontWeight: 700, fontSize: 15, minWidth: 60, textAlign: 'right' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 },
  statCard:      { background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  statIcon:      { fontSize: 22 },
  statNum:       { fontSize: 24, fontWeight: 800 },
  statLabel:     { color: '#64748b', fontSize: 12, textAlign: 'center' },
  appRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', borderRadius: 8, padding: '12px 16px' },
  appTitle:      { color: '#e2e8f0', fontSize: 14, fontWeight: 500 },
  statusBadge:   { borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 },
  empty:         { textAlign: 'center', padding: '32px 0' },
};
