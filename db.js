const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { table, method, data, match, select } = req.body || {};
  if (!table) return res.status(400).json({ error: 'No table specified' });

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Prefer': 'return=representation'
  };

  try {
    let url = SUPABASE_URL + '/rest/v1/' + table;
    let fetchMethod = 'GET';
    let body = null;

    if (method === 'select') {
      const params = new URLSearchParams();
      if (select) params.set('select', select);
      if (match) Object.entries(match).forEach(([k,v]) => params.set(k, 'eq.' + v));
      if (params.toString()) url += '?' + params.toString();
      fetchMethod = 'GET';
    } else if (method === 'insert') {
      fetchMethod = 'POST';
      body = JSON.stringify(data);
    } else if (method === 'update') {
      const params = new URLSearchParams();
      if (match) Object.entries(match).forEach(([k,v]) => params.set(k, 'eq.' + v));
      if (params.toString()) url += '?' + params.toString();
      fetchMethod = 'PATCH';
      body = JSON.stringify(data);
    } else if (method === 'delete') {
      const params = new URLSearchParams();
      if (match) Object.entries(match).forEach(([k,v]) => params.set(k, 'eq.' + v));
      if (params.toString()) url += '?' + params.toString();
      fetchMethod = 'DELETE';
    }

    const response = await fetch(url, { method: fetchMethod, headers, body });
    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
