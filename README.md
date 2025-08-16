# AI 助手应用

一个基于 Nuxt4 + NuxtUI 的智能应用，集成了文本翻译和变量命名生成功能。

## 技术栈

- **框架**: Nuxt 4
- **UI 组件库**: NuxtUI
- **编辑器**: Tiptap
- **样式**: Tailwind CSS
- **图标**: Lucide Icons
- **AI 服务**: 豆包大模型 API

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 功能特性

### 📝 文本翻译

- **实时翻译**: 基于豆包大模型的智能翻译
- **Markdown 支持**: 完整的 Markdown 格式支持
- **富文本编辑**: 使用 Tiptap 编辑器，支持粘贴自动发送
- **消息历史**: 本地存储对话历史，支持滚动查看
- **响应式设计**: 适配各种设备尺寸

### 🔤 变量命名

- **智能生成**: AI 根据中文词汇生成符合编程规范的变量名
- **命名规范**: 支持 camelCase、PascalCase 等命名风格
- **一键复制**: 点击任意位置或悬停显示复制按钮
- **实时反馈**: 复制成功/失败通知提示
- **格式无关**: 智能解析 AI 返回结果，提取所有变量名

### 🎨 通用特性

- **现代化 UI**: 基于 NuxtUI 的美观界面
- **主题支持**: 深色/浅色主题自动适配
- **导航系统**: 统一的导航栏，功能间快速切换
- **通知系统**: Toast 通知提供操作反馈

## 项目结构

```
├── app/                         # 应用目录 (Nuxt4 新结构)
│   ├── app.vue                  # 应用入口
│   ├── pages/                   # 页面
│   │   ├── articles.vue         # 文本翻译页面
│   │   └── variable.vue         # 变量命名页面
│   ├── components/              # 组件
│   │   ├── HtmlContent/         # Markdown 渲染组件
│   │   ├── Tiptap/              # 编辑器组件
│   │   ├── ScrollBottomButton.vue
│   │   └── TranslateNavigation.vue
│   ├── utils/                   # 工具函数
│   │   ├── scroll.ts            # 滚动相关工具
│   │   ├── sse.ts               # Server-Sent Events 处理
│   │   ├── storage.ts           # 本地存储工具
│   │   └── uuid.ts              # UUID 生成工具
│   └── assets/                  # 静态资源
│       ├── css/                 # 样式文件
│       └── MiSans/              # 字体文件
├── nuxt.config.ts               # Nuxt 配置
└── package.json                 # 项目依赖
```

## 使用说明

### 文本翻译

1. 在编辑器中输入要翻译的文本
2. 支持 Markdown 格式
3. 点击发送按钮或按回车键提交
4. AI 将实时返回翻译结果
5. 支持粘贴自动发送功能

### 变量命名

1. 在输入框中输入中文词汇或短语
2. 点击"生成变量名"按钮
3. AI 将生成符合编程规范的变量名
4. 点击任意变量名或悬停显示复制按钮
5. 一键复制到剪贴板

## 技术特点

- **现代化架构**: 基于 Nuxt 4 的最新特性
- **组件化设计**: 高度模块化的组件结构
- **AI 集成**: 无缝集成豆包大模型 API
- **实时通信**: 使用 SSE 实现流式响应
- **本地存储**: 支持消息历史持久化
- **响应式设计**: 完美适配各种设备

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License
