export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const r = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.DEEPSEEK_KEY
    },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 1000, messages })
  });

  const data = await r.json();
  if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || '请求失败' });
  res.json({ text: data.choices?.[0]?.message?.content || '' });
}
