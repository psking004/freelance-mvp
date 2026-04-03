import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../App';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err,  setErr]  = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const res = await api.post('signup', form);
    setLoading(false);
    if (res.error) return setErr(res.error);
    login(res.user, res.token);
    navigate('/dashboard');
  };

  const field = (key, placeholder, type = 'text') => ({
    style: s.inp,
    type,
    placeholder,
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    required: true,
  });

  return (
    <div style={s.outer}>
      <div style={s.card}>
        <h2 style={s.title}>Create account</h2>
        <p style={s.sub}>Join FreelanceUp and build your reputation</p>

        {err && <div style={s.err}>{err}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Full Name</label>
          <input {...field('name', 'Your name')} />

          <label style={s.label}>Email</label>
          <input {...field('email', 'you@example.com', 'email')} />

          <label style={s.label}>Password</label>
          <input {...field('password', 'Min 6 characters', 'password')} />

          <div style={s.hint}>
            🔒 You start with 20 trust points just for joining!
          </div>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up Free'}
          </button>
        </form>

        <p style={s.foot}>
          Already have an account?{' '}
          <Link to="/login" style={s.anchor}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  outer:  { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 53px)', padding: 16 },
  card:   { width: '100%', maxWidth: 380, background: '#1e293b', borderRadius: 14, padding: 36, border: '1px solid #334155' },
  title:  { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 4 },
  sub:    { color: '#64748b', fontSize: 13, marginBottom: 24 },
  form:   { display: 'flex', flexDirection: 'column', gap: 12 },
  label:  { color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' },
  inp:    { padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: 14, outline: 'none' },
  btn:    { padding: 12, background: '#0ea5e9', border: 'none', color: '#fff', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 700, marginTop: 4 },
  err:    { background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 8 },
  hint:   { background: '#0c2540', border: '1px solid #0369a1', borderRadius: 8, padding: '10px 14px', color: '#7dd3fc', fontSize: 12 },
  foot:   { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 20 },
  anchor: { color: '#38bdf8', textDecoration: 'none' },
};
