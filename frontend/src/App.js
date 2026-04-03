import React, { createContext, useContext, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from 'react-router-dom';
import Login     from './pages/Login';
import Signup    from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SkillTest from './pages/SkillTest';
import Task      from './pages/Task';
import Jobs      from './pages/Jobs';
import Profile   from './pages/Profile';

export const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🚀 FreelanceUp</span>
      <div style={styles.navLinks}>
        {[
          ['Dashboard', '/dashboard'],
          ['Skill Test', '/skill-test'],
          ['Task',       '/task'],
          ['Jobs',       '/jobs'],
          ['Profile',    '/profile'],
        ].map(([label, path]) => (
          <Link key={path} to={path} style={styles.link}>
            {label}
          </Link>
        ))}
      </div>
      <button
        style={styles.logoutBtn}
        onClick={() => { logout(); navigate('/login'); }}
      >
        Logout
      </button>
    </nav>
  );
}

function Private({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Nav />
        <div style={styles.page}>
          <Routes>
            <Route path="/login"      element={<Login />} />
            <Route path="/signup"     element={<Signup />} />
            <Route path="/dashboard"  element={<Private><Dashboard /></Private>} />
            <Route path="/skill-test" element={<Private><SkillTest /></Private>} />
            <Route path="/task"       element={<Private><Task /></Private>} />
            <Route path="/jobs"       element={<Private><Jobs /></Private>} />
            <Route path="/profile"    element={<Private><Profile /></Private>} />
            <Route path="*"           element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}

const styles = {
  nav: {
    display:        'flex',
    alignItems:     'center',
    gap:            16,
    padding:        '12px 28px',
    background:     '#0f172a',
    borderBottom:   '1px solid #1e293b',
    position:       'sticky',
    top:            0,
    zIndex:         100,
  },
  logo: {
    color:       '#38bdf8',
    fontWeight:  700,
    fontSize:    18,
    marginRight: 'auto',
    letterSpacing: '-0.3px',
  },
  navLinks: { display: 'flex', gap: 4 },
  link: {
    color:          '#94a3b8',
    textDecoration: 'none',
    fontSize:       13,
    padding:        '6px 12px',
    borderRadius:   6,
    transition:     'background 0.15s, color 0.15s',
  },
  logoutBtn: {
    background:   '#ef4444',
    border:       'none',
    color:        '#fff',
    padding:      '7px 16px',
    borderRadius: 6,
    cursor:       'pointer',
    fontSize:     13,
    fontWeight:   600,
  },
  page: { minHeight: 'calc(100vh - 53px)' },
};
