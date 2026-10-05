const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

export const getApiUrl = () => {
  return BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
};

export const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Centralized fetch client that automatically attaches auth headers and JSON Content-Type when appropriate.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${getApiUrl()}${endpoint.replace(/^\//, '')}`;

  const token = getAuthToken();
  const headers = {
    ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

export default {
  getApiUrl,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  apiFetch,
};
