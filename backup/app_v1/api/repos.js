/** Repositories: one method per endpoint in backend/openapi.yaml. Needs client.js loaded first. */
const repos = {
  auth: {
    async login(username, password) {
      const r = await api.post('/auth/login', { username, password });
      api.setToken(r.token);
      return r.user;
    },
    async register(input) {
      const r = await api.post('/auth/register', input);
      api.setToken(r.token);
      return r.user;
    },
    async loginWithGoogle(idToken) {
      const r = await api.post('/auth/google', { idToken });
      api.setToken(r.token);
      return r.user;
    },
    logout() {
      api.setToken(null);
    },
  },
  profile: {
    get: () => api.get('/me'),
    update: (patch) => api.put('/me', patch),
  },
  categories: {
    list: () => api.get('/categories'),
  },
  cards: {
    list({ category, remembered, q } = {}) {
      const p = new URLSearchParams();
      if (category != null) p.set('category', category);
      if (remembered != null) p.set('remembered', remembered);
      if (q) p.set('q', q);
      const qs = p.toString();
      return api.get('/cards' + (qs ? `?${qs}` : ''));
    },
    create: (card) => api.post('/cards', card),
    update: (id, card) => api.put(`/cards/${id}`, card),
    remove: (id) => api.del(`/cards/${id}`),
    setRemembered: (id, remembered) => api.patch(`/cards/${id}/remembered`, { remembered }),
  },
  quiz: {
    submit: (categoryId, answers) => api.post('/quizzes', { categoryId, answers }),
    history: (limit = 20) => api.get(`/quizzes?limit=${limit}`),
  },
};

