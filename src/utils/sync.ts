let KV_URL = import.meta.env.VITE_KV_REST_API_URL || import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
let KV_TOKEN = import.meta.env.VITE_KV_REST_API_TOKEN || import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

const REDIS_URL = import.meta.env.VITE_REDIS_URL;
if (REDIS_URL && !KV_URL) {
  try {
    const url = new URL(REDIS_URL);
    KV_TOKEN = url.password;
    KV_URL = `https://${url.hostname}`;
  } catch (e) {
    console.error('Failed to parse VITE_REDIS_URL');
  }
}

export const saveProgressToCloud = async (syncCode: string, completedNodes: string[]) => {
  if (!KV_URL || !KV_TOKEN) {
    console.warn('Vercel KV credentials not found in environment.');
    return false;
  }
  try {
    await fetch(`${KV_URL}/set/sync_${syncCode}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      method: 'POST',
      body: JSON.stringify(JSON.stringify(completedNodes)) // KV Rest API expects stringified value
    });
    return true;
  } catch (e) {
    console.error('Error saving to cloud:', e);
    return false;
  }
};

export const loadProgressFromCloud = async (syncCode: string): Promise<string[] | null> => {
  if (!KV_URL || !KV_TOKEN) {
    console.warn('Vercel KV credentials not found in environment.');
    return null;
  }
  try {
    const res = await fetch(`${KV_URL}/get/sync_${syncCode}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const data = await res.json();
    if (data.result) {
      return JSON.parse(data.result);
    }
    return null;
  } catch (e) {
    console.error('Error loading from cloud:', e);
    return null;
  }
};

export const generateSyncCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
