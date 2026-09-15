// Bloggist API client service

const TOKEN_KEY = 'bloggist_admin_token';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(endpoint, options = {}, retries = 2, delay = 350) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAdminToken();
  if (token) {
    headers['x-admin-token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(endpoint, {
      ...options,
      headers
    });
  } catch (networkErr) {
    // If network fails (e.g. server restarting or container warmup) and retries remain:
    if (retries > 0 && (!options.method || options.method === 'GET')) {
      await new Promise((r) => setTimeout(r, delay));
      return request(endpoint, options, retries - 1, delay * 2);
    }
    throw new Error(networkErr.message || 'Unable to connect to server. Please try again.');
  }

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    // If server responded with HTML (e.g., warmup page or 502/503 during restart)
    if (!res.ok) {
      if (retries > 0 && (!options.method || options.method === 'GET')) {
        await new Promise((r) => setTimeout(r, delay));
        return request(endpoint, options, retries - 1, delay * 2);
      }
      throw new Error(`Server temporarily unavailable (status ${res.status})`);
    }
    const text = await res.text().catch(() => '');
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    const error = new Error(data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  async login(pin) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin })
    });
    if (res.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      clearAdminToken();
    }
  },

  async checkAuth() {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await request('/api/auth/me');
      return !!res.authenticated;
    } catch {
      clearAdminToken();
      return false;
    }
  },

  // Articles
  async getArticles(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.limit) searchParams.set('limit', params.limit);

    const query = searchParams.toString();
    const data = await request(`/api/articles${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : [];
  },

  async getArticle(slugOrId) {
    return request(`/api/articles/${slugOrId}`);
  },

  async recordView(id) {
    return request(`/api/articles/${id}/view`, { method: 'POST' });
  },

  async react(id, type) {
    return request(`/api/articles/${id}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  },

  async addComment(id, { name, content }) {
    return request(`/api/articles/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ name, content })
    });
  },

  async reportArticle(id, { reason }) {
    return request(`/api/articles/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Contact
  async sendContact(data) {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin Article Management
  async createArticle(data) {
    return request('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateArticle(id, data) {
    return request(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteArticle(id) {
    return request(`/api/articles/${id}`, {
      method: 'DELETE'
    });
  },

  // Image Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAdminToken();
    const headers = {};
    if (token) {
      headers['x-admin-token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch('/api/uploads', {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (networkErr) {
      throw new Error('Network error uploading image. Please check your connection and try again.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Image upload failed');
    }
    return data;
  },

  // Admin Analytics & Reports
  async getAnalytics() {
    const data = await request('/api/admin/analytics');
    return {
      totalViews: data?.totalViews || 0,
      totalArticles: data?.totalArticles || 0,
      totalComments: data?.totalComments || 0,
      mostViewed: Array.isArray(data?.mostViewed) ? data.mostViewed : [],
      recentComments: Array.isArray(data?.recentComments) ? data.recentComments : [],
      reports: Array.isArray(data?.reports) ? data.reports : []
    };
  },

  async getReports() {
    const data = await request('/api/admin/reports');
    return Array.isArray(data) ? data : [];
  },

  async resolveReport(id) {
    return request(`/api/admin/reports/${id}/resolve`, { method: 'POST' });
  }
};
