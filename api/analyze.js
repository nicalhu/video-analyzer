// Vercel Serverless Function - API代理
// 用于解决CORS跨域问题

export default async function handler(req, res) {
  // 设置CORS头，允许所有来源访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, imageDataUrl, apiKey, model, baseUrl } = req.body;

    if (!provider || !imageDataUrl || !apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数：provider, imageDataUrl, apiKey' 
      });
    }

    let result;

    // 根据不同的AI平台调用对应的API
    if (provider === 'qwen') {
      result = await analyzeWithQwen(imageDataUrl, apiKey, model, baseUrl);
    } else if (provider === 'volcengine') {
      result = await analyzeWithVolcEngine(imageDataUrl, apiKey, model, baseUrl);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `不支持的AI平台: ${provider}` 
      });
    }

    return res.status(200).json({ success: true, content: result });

  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || '服务器内部错误' 
    });
  }
}

// 千问API调用
async function analyzeWithQwen(imageDataUrl, apiKey, model = 'qwen-vl-max', baseUrl) {
  const isCustomEndpoint = baseUrl && baseUrl.trim() !== '';
  
  let apiUrl, requestBody, headers;

  if (isCustomEndpoint) {
    // 自建API - OpenAI兼容格式
    apiUrl = baseUrl;
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的视觉分析专家。'
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageDataUrl }
            },
            {
              type: 'text',
              text: getAnalysisPrompt()
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    };
  } else {
    // 官方API - 千问原生格式
    apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    requestBody = {
      model: model,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { image: imageDataUrl },
              { text: getAnalysisPrompt() }
            ]
          }
        ]
      },
      parameters: {
        max_tokens: 2000
      }
    };
  }

  // 使用动态import来加载node-fetch（兼容Vercel Edge Runtime）
  let fetchImpl;
  if (typeof fetch !== 'undefined') {
    // 使用内置的fetch（Node.js 18+）
    fetchImpl = fetch;
  } else {
    // 降级到node-fetch
    const nodeFetch = await import('node-fetch');
    fetchImpl = nodeFetch.default;
  }

  const response = await fetchImpl(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData.message || errorData.error?.message || `千问API错误: ${response.status}`);
  }

  const data = await response.json();

  if (isCustomEndpoint) {
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
  } else {
    if (data.output && data.output.choices && data.output.choices[0]) {
      const content = data.output.choices[0].message.content;
      if (Array.isArray(content)) {
        return content.find(item => item.text)?.text || '无法获取分析结果';
      } else if (typeof content === 'string') {
        return content;
      }
    }
  }

  throw new Error('千问API返回格式错误');
}

// 火山引擎API调用
async function analyzeWithVolcEngine(imageDataUrl, apiKey, model = 'doubao-vision-pro-32k', baseUrl = 'https://ark.cn-beijing.volces.com/api/v3') {
  // 使用动态import来加载node-fetch（兼容Vercel Edge Runtime）
  let fetchImpl;
  if (typeof fetch !== 'undefined') {
    // 使用内置的fetch（Node.js 18+）
    fetchImpl = fetch;
  } else {
    // 降级到node-fetch
    const nodeFetch = await import('node-fetch');
    fetchImpl = nodeFetch.default;
  }

  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageDataUrl }
            },
            {
              type: 'text',
              text: getAnalysisPrompt()
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData.error?.message || `火山引擎API错误: ${response.status}`);
  }

  const data = await response.json();

  if (data.choices && data.choices[0]) {
    return data.choices[0].message.content;
  }

  throw new Error('火山引擎API返回格式错误');
}

// 分析提示词
function getAnalysisPrompt() {
  return `请详细分析这个画面，输出【中文版】和【英文版】两个版本，用于AI视频/图片生成。格式如下：

=== 中文版 ===

【文生图提示词】
详细描述场景、人物、服饰、动作、光线、色彩、氛围、构图、视角等，用专业摄影术语

【动效提示词】
描述画面中的动态元素：人物表情变化、肢体微动作、头发/衣物飘动、眼神转移、呼吸起伏、环境元素（雨/雪/光影）变化等。例如："眼神缓缓从近处移向远方，目光逐渐变得空灵悠远，轻轻叹息，嘴唇微微开合，发丝随风轻扬飘动，耳饰微微摇晃,深呼吸起伏，雪花从眼前缓缓飘过，5秒渐变循环"

【基础参数】
resolution=3840x2160, fps=60, duration=5s, stabilization=3

【运镜控制】
type=[推进push_in/拉远zoom_out/左旋pan_left/右旋pan_right/上摇tilt_up/下摇tilt_down/平移track/固定static/环绕orbit], speed=[0.5-2.0], focus_point=(x,y), angle=[角度], scale=[缩放]

【画面约束】
fov=[视场角]°, motion_blur=[0-1], target_ratio=[主体占比]%, depth_of_field=[0-1]

=== 英文版 ===

【Image Generation Prompt】
Detailed scene description in English...

【Motion Effect Prompt】
Describe dynamic elements in English...

【Technical Parameters】
resolution=3840x2160, fps=60, duration=5s, stabilization=3

【Camera Control】
type=[push_in/zoom_out/pan_left/pan_right/tilt_up/tilt_down/track/static/orbit], speed=[0.5-2.0], focus_point=(x,y), angle=[degrees], scale=[zoom]

【Visual Constraints】
fov=[degrees]°, motion_blur=[0-1], target_ratio=[percent]%, depth_of_field=[0-1]`;
}
