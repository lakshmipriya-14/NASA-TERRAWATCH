/**
 * TerraWatch Frontend API Client
 * Connects to the FastAPI backend endpoints with fallback safety and error handling.
 */

const BASE_URL = '/api';

export async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health & Stats
  getHealth: () => fetchApi('/health'),
  getStats: () => fetchApi('/stats'),

  // Regions & Observations
  getRegions: (category) => fetchApi(`/regions${category ? `?category=${category}` : ''}`),
  getObservations: (category) => fetchApi(`/observations${category ? `?category=${category}` : ''}`),

  // Analyses
  getRecentAnalyses: (limit = 10) => fetchApi(`/analyses?limit=${limit}`),
  getAnalysis: (id) => fetchApi(`/analysis/${id}`),

  // Run Modules
  runWaterAnalysis: (params) =>
    fetchApi('/analyze/water', { method: 'POST', body: JSON.stringify(params) }),
  runForestAnalysis: (params) =>
    fetchApi('/analyze/forest', { method: 'POST', body: JSON.stringify(params) }),
  runAgroAnalysis: (params) =>
    fetchApi('/analyze/agriculture', { method: 'POST', body: JSON.stringify(params) }),
  runDeformationAnalysis: (params) =>
    fetchApi('/analyze/deformation', { method: 'POST', body: JSON.stringify(params) }),

  // AI Insights
  getAIInsights: (analysisId, userQuery = null) =>
    fetchApi('/insights', {
      method: 'POST',
      body: JSON.stringify({ analysis_id: analysisId, user_query: userQuery }),
    }),

  // File Upload
  uploadProduct: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  },
};

export default api;
