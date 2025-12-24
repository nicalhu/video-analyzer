# 🚀 视频分析工具 - Vercel部署指南

## 📦 项目简介

这是一个**完全免费、在线可用**的视频逐帧分析工具,部署到Vercel后可获得:
- ✅ 免费HTTPS域名 (如: `https://video-analyzer.vercel.app`)
- ✅ 全球CDN加速
- ✅ 自动SSL证书
- ✅ 任何人可访问
- ✅ 零成本运行

---

## 🎯 部署步骤(仅需5分钟)

### 方法一:通过GitHub部署(推荐)

#### 第1步:创建GitHub仓库

1. **登录GitHub**: 访问 https://github.com 并登录账号 `nicalhu@qq.com`

2. **创建新仓库**:
   - 点击右上角 `+` → `New repository`
   - Repository name: `video-analyzer` (可自定义)
   - Description: `视频逐帧分析与AI提示词生成工具`
   - 选择 `Public` (公开仓库)
   - ✅ 勾选 `Add a README file`
   - 点击 `Create repository`

#### 第2步:上传文件到GitHub

**方式A:网页上传(简单)**

1. 在仓库页面点击 `Add file` → `Upload files`
2. 将以下文件拖拽上传:
   - `视频分析工具-独立版.html`
   - `vercel.json`
   - `README-Vercel部署.md`
3. 填写提交信息: `初始化视频分析工具`
4. 点击 `Commit changes`

**方式B:命令行上传(高级)**

```bash
# 在项目目录下执行
cd e:/video
git init
git add 视频分析工具-独立版.html vercel.json README-Vercel部署.md
git commit -m "初始化视频分析工具"
git branch -M main
git remote add origin https://github.com/nicalhu/video-analyzer.git
git push -u origin main
```

#### 第3步:部署到Vercel

1. **注册Vercel**: 访问 https://vercel.com/signup
   - 点击 `Continue with GitHub` 
   - 使用GitHub账号授权登录

2. **导入项目**:
   - 登录后,点击 `Add New...` → `Project`
   - 选择 `Import Git Repository`
   - 找到并选择 `video-analyzer` 仓库
   - 点击 `Import`

3. **配置项目**:
   - **Framework Preset**: 选择 `Other` (或留空)
   - **Root Directory**: 留空
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - 点击 `Deploy` 开始部署

4. **等待部署完成** (约30-60秒):
   - 部署成功后会显示 `🎉 Congratulations!`
   - 获得访问地址,如: `https://video-analyzer.vercel.app`

---

## ✅ 部署成功后

### 访问您的应用

打开浏览器访问:
```
https://你的项目名.vercel.app
```

### 分享给用户

直接发送上述链接,任何人都可以访问使用!

### 自定义域名(可选)

在Vercel项目设置中可绑定自己的域名:
1. 进入项目 → `Settings` → `Domains`
2. 添加自定义域名
3. 按提示配置DNS解析

---

## 🔧 使用说明

### 首次使用

1. 打开网址后,在**API配置**区域填写:
   - 选择AI平台(推荐:千问)
   - 填写API Key
   - 点击 `💾 保存配置`

2. 上传视频文件

3. 点击 `开始分析`

### API Key获取

**千问(推荐)**:
- 官网: https://dashscope.console.aliyun.com/apiKey
- 免费额度: 100万tokens/月

**火山引擎**:
- 官网: https://console.volcengine.com/
- 模型: `doubao-vision-pro-32k`

---

## 📋 功能特性

- ✅ 智能分镜检测(自动识别镜头切换)
- ✅ 固定间隔提取
- ✅ 画面质量过滤
- ✅ AI提示词生成(中英文双语)
- ✅ 支持千问/火山引擎API
- ✅ 导出TXT/JSON格式
- ✅ 完全浏览器端处理(视频不上传)

---

## ❓ 常见问题

### Q1: 部署后打不开页面?
**A**: 
1. 检查Vercel部署日志是否有错误
2. 确认 `视频分析工具-独立版.html` 已上传
3. 等待1-2分钟DNS生效

### Q2: 能处理多大的视频?
**A**: 
- 建议 <500MB,时长 <10分钟
- 浏览器端处理,取决于用户设备性能

### Q3: API调用会收费吗?
**A**:
- 千问:免费100万tokens/月,超出按量付费
- 火山引擎:新用户有免费额度

### Q4: 如何更新代码?
**A**:
1. 在GitHub仓库修改文件
2. Vercel会自动检测并重新部署
3. 或在Vercel后台点击 `Redeploy`

### Q5: 可以多人同时使用吗?
**A**:
- ✅ 可以!每个用户在浏览器本地处理
- ✅ 每个用户需配置自己的API Key
- ✅ Vercel免费版支持无限访问量

---

## 🎉 优势总结

| 特性 | 本地版 | Vercel部署版 |
|------|--------|--------------|
| 是否需要安装 | ❌ 需要Python/Node.js | ✅ 无需安装 |
| 用户访问 | ❌ 需本地启动 | ✅ 直接访问URL |
| 跨域问题 | ⚠️ 需配置 | ✅ 自动解决 |
| 分享难度 | ❌ 需发送文件 | ✅ 发送链接即可 |
| 成本 | 免费 | ✅ 完全免费 |
| 访问速度 | 取决于本地 | ✅ 全球CDN加速 |

---

## 📧 技术支持

如有问题,请检查:
1. Vercel部署日志
2. 浏览器控制台(F12)
3. 确认API Key配置正确

---

**部署时间**: 约5分钟  
**技术难度**: ⭐☆☆☆☆ (极简单)  
**推荐指数**: ⭐⭐⭐⭐⭐

🎬 **立即开始部署,让任何人都能使用您的视频分析工具!**
