const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const api = {
  post: async (url, body) => {
    const res = await fetch(`/${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },
  get: async (url) => {
    const res = await fetch(`/${url}`, { headers: getHeaders() });
    return res.json();
  },
};
