const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const normalizedBaseUrl = rawBaseUrl.endsWith('/')
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

export const getApiUrl = (path) => `${normalizedBaseUrl}${path}`;
