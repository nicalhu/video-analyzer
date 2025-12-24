// Vercel Serverless Function - 千问 API 代理
// 文件路径: /api/qianwen-proxy.js

export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model = 'Qwen3-32B-AWQ' } = req.body;

        // 转发到你的千问 API
        const response = await fetch('http://43.173.153.29:11436/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer xxx',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 8192
            })
        });

        const data = await response.json();

        // 返回结果
        res.status(200).json(data);
    } catch (error) {
        console.error('代理错误:', error);
        res.status(500).json({ 
            error: '代理请求失败', 
            message: error.message 
        });
    }
}
