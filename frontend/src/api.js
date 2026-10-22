// API base URL. Leave REACT_APP_API_URL empty when the backend serves this build
// (same origin) or in dev (CRA "proxy" forwards /api to localhost:5000).
// Set it to e.g. https://your-backend.example.com when the frontend is deployed separately.
const API_BASE = `${(process.env.REACT_APP_API_URL || '').replace(/\/$/, '')}/api`;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const api = {
  post: async (url, body) => {
    const res = await fetch(`${API_BASE}/${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },
  get: async (url) => {
    const res = await fetch(`${API_BASE}/${url}`, { headers: getHeaders() });
    return res.json();
  },
};
