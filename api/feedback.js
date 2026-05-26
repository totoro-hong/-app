module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, category, contact } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '请填写反馈内容' });
  }

  const token = process.env.GH_TOKEN;
  if (!token) {
    return res.status(500).json({ error: '服务器未配置 GitHub Token，请联系开发者' });
  }

  try {
    const body = [
      '## 用户反馈',
      '',
      '**分类**: ' + (category || '建议'),
      '**联系**: ' + (contact || '未提供'),
      '',
      content
    ].join('\n');

    const response = await fetch('https://api.github.com/repos/totoro-hong/-app/issues', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        title: '💡 用户反馈: ' + (category || '建议'),
        body: body,
        labels: ['feedback']
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'GitHub API error');

    res.status(200).json({ ok: true, url: data.html_url });
  } catch (err) {
    console.error('Feedback API error:', err);
    res.status(500).json({ error: '提交失败: ' + err.message });
  }
};
