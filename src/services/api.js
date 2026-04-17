import { transformVessels } from './transform';

const API_BASE_URL =
  'https://wa8v5iats6.execute-api.ap-southeast-1.amazonaws.com/prod';

export async function fetchLiveVessels(token) {
  const url = `${API_BASE_URL}/api/live/vessels`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  return transformVessels(data);
}