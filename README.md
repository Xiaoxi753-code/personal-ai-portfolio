# Personal AI Portfolio

一个融合明亮视觉个人主页、静态生活页面与 AI 数字分身的现代化 Next.js 项目。

## 项目简介

本项目使用个人主页展示公开项目与成长记录，并通过 AI 数字分身以流式对话的方式回答访客问题。数字分身只根据预先确认的公开资料回答，资料不足时会使用统一兜底说明，避免随意编造个人信息。

## 核心特性

- **明亮视觉与视差滚动：** 固定渐变壁纸、柔和光晕、SVG 波浪和白色内容层共同实现“内容上滑覆盖背景”的视觉效果。
- **响应式多页面 UI：** 支持桌面端和移动端，包含首页、恋爱日常 `/love` 和留言板 `/message`。
- **Next.js App Router：** 使用文件系统路由管理页面，并通过共享导航组件完成页面跳转。
- **AI 流式对话：** 使用 Vercel AI SDK，让回答以逐步输出的方式显示。
- **OpenAI 兼容模型：** 可通过环境变量配置 API Key、Base URL 和模型名称，便于接入 DeepSeek 等兼容平台。
- **内容边界控制：** 服务端系统提示词限制数字分身只能使用公开资料回答，并对未知或隐私问题返回统一兜底文案。
- **基础费用保护：** 前后端均限制单次问题最多 100 个字符，服务端限制模型单次最大输出为 500 tokens。
- **隐私提示：** 聊天窗口明确提示 AI 回答可能存在误差、对话暂不长期保存，并提醒访客不要输入敏感信息。
- **纯静态展示页：** 恋爱页和留言板目前使用 Mock Data，不依赖数据库、登录或图片上传功能。

## 技术栈

- [Next.js](https://nextjs.org/) 16（App Router）
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Vercel AI SDK](https://ai-sdk.dev/)
- OpenAI 兼容模型 API
- [Vercel](https://vercel.com/) 部署平台

## 快速启动

### 1. 准备开发环境

请先安装：

- [Node.js](https://nodejs.org/) 20.9 或更高版本
- [Git](https://git-scm.com/)
- 一个代码编辑器，例如 [Visual Studio Code](https://code.visualstudio.com/)

验证环境：

```bash
node --version
npm --version
git --version
```

### 2. 克隆项目

```bash
git clone https://github.com/Xiaoxi753-code/personal-ai-portfolio.git
cd personal-ai-portfolio
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

项目根目录提供了安全模板 `.env.local.example`。请复制它并创建仅供本机使用的 `.env.local`。

PowerShell：

```powershell
Copy-Item .env.local.example .env.local
```

macOS / Linux：

```bash
cp .env.local.example .env.local
```

然后打开 `.env.local`，填写自己的模型平台配置：

```dotenv
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
```

可以前往 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys) 注册并创建 API Key，也可以使用其他支持 OpenAI API 格式的模型平台；使用其他平台时，请同步修改 `AI_BASE_URL` 和 `AI_MODEL`。

> 安全提醒：不要把真实 API Key 发到聊天、截图、Issue 或文档中，也不要提交 `.env.local`。项目的 `.gitignore` 已默认忽略该文件。

### 5. 启动本地开发服务器

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

可访问的主要页面：

- 首页：[http://localhost:3000](http://localhost:3000)
- 恋爱日常：[http://localhost:3000/love](http://localhost:3000/love)
- 留言板：[http://localhost:3000/message](http://localhost:3000/message)

## 常用命令

```bash
npm run dev    # 启动本地开发服务器
npm run lint   # 检查代码规范
npm run build  # 执行生产构建
npm run start  # 启动已构建的生产版本
```

## 部署到 Vercel

1. 将代码推送到 GitHub。
2. 在 Vercel 中导入该 GitHub 仓库。
3. 在项目的 Environment Variables 中配置 `AI_API_KEY`、`AI_BASE_URL` 和 `AI_MODEL`。
4. 触发部署；如果环境变量是在首次部署后添加或修改，请执行一次 Redeploy。

请勿将本地 `.env.local` 上传到 GitHub。Vercel 会在构建和运行环境中安全注入后台配置的环境变量。

## 当前范围

- 留言板发布按钮目前仅为静态 UI，不会保存留言。
- 恋爱页内容和留言卡片均为 Mock Data。
- 项目尚未接入 Supabase，暂不提供注册、登录或数据库读写功能。
- 当前输入长度限制不等同于完整的按 IP 请求频率限制；公开运营前仍建议补充限流、监控和模型平台额度提醒。

## License

当前项目主要用于个人学习、作品展示与全栈开发实践。未经项目所有者明确许可，请勿直接复制其中的个人资料或冒充数字分身本人。
