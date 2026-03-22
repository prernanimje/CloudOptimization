import axios from 'axios';

const API_ORIGIN =
  import.meta?.env?.VITE_API_URL ||
  import.meta?.env?.VITE_BACKEND_URL ||
  '';

// Backend mounts all routers under `/api` (see `backend/app/main.py`).
// In dev, Vite proxies `/api` -> backend, so we can use a same-origin baseURL.
const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, '')}/api` : '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrap(res) {
  return res.data;
}

export const instancesAPI = {
  getAllInstances: async () => unwrap(await client.get('/instances')),
  getInstance: async (instanceId) => unwrap(await client.get(`/instances/${instanceId}`)),
  createInstance: async (payload) => unwrap(await client.post('/instances', payload)),
  updateInstance: async (instanceId, payload) =>
    unwrap(await client.put(`/instances/${instanceId}`, payload)),
  deleteInstance: async (instanceId) => unwrap(await client.delete(`/instances/${instanceId}`)),
};

export const uploadAPI = {
  uploadCSV: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap(
      await client.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },
  getExampleCSV: async () => unwrap(await client.get('/upload/example')),
};

export const analysisAPI = {
  analyzeInstance: async (instanceId) => unwrap(await client.post(`/analyze/${instanceId}`)),
  analyzeByName: async (instanceName) =>
    unwrap(await client.get(`/analyze/instance/${encodeURIComponent(instanceName)}`)),
  getRecommendations: async (payload) => unwrap(await client.post('/recommendations', payload)),
};

export const metricsAPI = {
  getMetrics: async (instanceId, hours = 24) =>
    unwrap(await client.get(`/metrics/${instanceId}`, { params: { hours } })),
  createMetric: async (instanceId, payload) =>
    unwrap(await client.post(`/metrics/${instanceId}`, payload)),
  getLatestMetric: async (instanceId) => unwrap(await client.get(`/metrics/${instanceId}/latest`)),
  getMetricsSummary: async (instanceId) => unwrap(await client.get(`/metrics-summary/${instanceId}`)),
};

export const healthAPI = {
  checkInstanceHealth: async (instanceId) => unwrap(await client.post(`/health/check/${instanceId}`)),
  getHealthChecks: async () => unwrap(await client.get('/health/check')),
  getInstanceAlerts: async (instanceId) => unwrap(await client.get(`/alerts/${instanceId}`)),
  getAllAlerts: async () => unwrap(await client.get('/alerts')),
};

export const authAPI = {
  login: async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return unwrap(await client.post('/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }));
  },
  register: async (userData) => unwrap(await client.post('/auth/register', userData)),
  me: async () => unwrap(await client.get('/auth/me')),
};

