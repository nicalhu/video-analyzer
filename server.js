require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置静态文件
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/frames', express.static('frames'));
app.use(express.static(__dirname)); // 提供当前目录的静态文件访问
app.use(express.json({ limit: '50mb' })); // 支持大的base64图片

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|flv|wmv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('只支持视频文件格式！'));
  }
});

// 主页路由
app.get('/', (req, res) => {
  // 优先查找视频分析工具-独立版.html
  const independentVersion = path.join(__dirname, '视频分析工具-独立版.html');
  const standardVersion = path.join(__dirname, 'video-analyzer.html');
  
  if (require('fs').existsSync(independentVersion)) {
    res.sendFile(independentVersion);
  } else if (require('fs').existsSync(standardVersion)) {
    res.sendFile(standardVersion);
  } else {
    res.status(404).send('HTML文件未找到，请确保 视频分析工具-独立版.html 或 video-analyzer.html 存在');
  }
});

// API代理路由 - DeepSeek
app.post('/api/analyze/deepseek', async (req, res) => {
  try {
    const { imageDataUrl, apiKey, model, baseUrl } = req.body;
    
    // ⚠️ 重要提示：当前 deepseek-chat 模型不支持图像输入
    // 建议使用火山引擎或千问的多模态模型
    res.status(400).json({ 
      success: false, 
      error: '⚠️ DeepSeek的deepseek-chat模型暂不支持图像识别功能。\n\n推荐方案：\n1. 切换到"火山引擎"平台（使用doubao-vision-pro-32k模型）\n2. 或切换到"千问"平台（使用qwen-vl-max模型）\n\n这两个平台都完整支持视频帧分析功能。' 
    });
    
  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

// API代理路由 - 火山引擎
app.post('/api/analyze/volcengine', async (req, res) => {
  try {
    const { imageDataUrl, apiKey, model, baseUrl } = req.body;
    
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              },
              {
                type: 'text',
                text: `请按照以下结构化公式分析这个视频画面，生成一句完整的AI视频提示词：

【结构公式】主场景 + 主体行为 + 剧情动作 + 拍摄手法 + 画面质感 + 镜头视角 + 情绪氛围

【参考示例】
中文版：现实风格视频 + 超市场景 + 调皮橘猫偷鱼剧情 + 安保追逐动作 + 手持仿纪录片拍摄 + 写实光影与轻微镜头抖动 + 第三人称动态跟拍 + 轻松幽默氛围

英文版：A realistic handheld mockumentary-style video / set in a supermarket / featuring a mischievous orange cat stealing a fish and being chased by a security guard / filmed with realistic lighting, slight camera shake, and cinematic motion blur / third-person dynamic follow camera / humorous tone like CCTV or real-life footage.

【输出要求】
1. 请用一句话完整描述，包含以上所有7个要素
2. 使用专业的影视和摄影术语
3. 先输出中文版，然后输出英文版（用"---"分隔）
4. 保持简洁但信息完整

请开始分析画面：`
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ success: true, content: response.data.choices[0].message.content });
  } catch (error) {
    console.error('火山引擎API错误:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

// API代理路由 - 千问
app.post('/api/analyze/qwen', async (req, res) => {
  try {
    const { imageDataUrl, apiKey, model } = req.body;
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        model: model,
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  image: imageDataUrl
                },
                {
                  text: `请按照以下结构化公式分析这个视频画面，生成一句完整的AI视频提示词：

【结构公式】主场景 + 主体行为 + 剧情动作 + 拍摄手法 + 画面质感 + 镜头视角 + 情绪氛围

【参考示例】
中文版：现实风格视频 + 超市场景 + 调皮橘猫偷鱼剧情 + 安保追逐动作 + 手持仿纪录片拍摄 + 写实光影与轻微镜头抖动 + 第三人称动态跟拍 + 轻松幽默氛围

英文版：A realistic handheld mockumentary-style video / set in a supermarket / featuring a mischievous orange cat stealing a fish and being chased by a security guard / filmed with realistic lighting, slight camera shake, and cinematic motion blur / third-person dynamic follow camera / humorous tone like CCTV or real-life footage.

【输出要求】
1. 请用一句话完整描述，包含以上所有7个要素
2. 使用专业的影视和摄影术语
3. 先输出中文版，然后输出英文版（用"---"分隔）
4. 保持简洁但信息完整

请开始分析画面：`
                }
              ]
            }
          ]
        },
        parameters: {
          max_tokens: 1000
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ success: true, content: response.data.output.choices[0].message.content[0].text });
  } catch (error) {
    console.error('千问API错误:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message 
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🎬 视频分析服务器已启动`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`⚙️  当前API提供商: ${process.env.API_PROVIDER || '未配置'}`);
  console.log(`========================================`);
});
