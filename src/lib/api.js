// Every number the UI shows comes from these responses. Nothing is computed
// browser-side.

const BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Malformed response from ${path}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    const err = new Error(body.error || body.detail || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export function askText(query, strategy) {
  return request('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, strategy }),
  });
}

export function askVoice(audioBlob, strategy, language = 'hi-IN') {
  const form = new FormData();
  form.append('audio', audioBlob, 'query.webm');
  if (strategy) form.append('strategy', strategy);
  form.append('language', language);
  return request('/api/voice', { method: 'POST', body: form });
}

export const getHealth = () => request('/api/health');
export const getStrategies = () => request('/api/strategies');
export const getBenchmark = () => request('/api/benchmark');
export const getCorpus = () => request('/api/corpus');
