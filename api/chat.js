const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;
  const key = process.env.DEEPSEEK_KEY;
  if (!key) return res.status(500).json({ error: '未配置 API Key' });

  const body = JSON.stringify({ model: 'deepseek-chat', max_tokens: 1000, messages });

  const options = {
    hostname: 'api.deepseek.com',
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (response.statusCode !== 200) {
            res.status(response.statusCode).json({ error: json?.error?.message || '请求失败' });
          } else {
            res.json({ text: json.choices?.[0]?.message?.content || '' });
          }
        } catch(e) {
          res.status(500).json({ error: '解析失败：' + e.message });
        }
        resolve();
      });
    });
    request.on('error', (e) => {
      res.status(500).json({ error: '网络错误：' + e.message });
      resolve();
    });
    request.write(body);
    request.end();
  });
};
