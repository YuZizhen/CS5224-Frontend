import { transformVessels } from './transform';

// Change this when using real API
const USE_MOCK = false;

const CONFIG = {
  mock: {
    baseUrl: 'http://localhost:8080',
    liveVesselsPath: '/api_live_vessels',
    token: null,
  },
  real: {
    baseUrl: 'https://wa8v5iats6.execute-api.ap-southeast-1.amazonaws.com/prod',
    liveVesselsPath: '/api/live/vessels',
    token: null, // 以后放真实 JWT
  },
};

function getCurrentConfig() {
  return USE_MOCK ? CONFIG.mock : CONFIG.real;
}

export async function fetchLiveVessels() {
  const config = getCurrentConfig();
  const url = `${config.baseUrl}${config.liveVesselsPath}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  return transformVessels(data);
}