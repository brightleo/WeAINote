# WeAINote Chrome 插件

## 项目概述

WeAINote 是一个基于 Chrome 浏览器的插件，主要功能是基于当前网页内容提供 AI 总结等服务。用户可以通过配置不同的提示词模板来实现不同的功能，如网页摘要、内容翻译、关键点提取等。

## 功能特性

### 1. 核心功能
- 基于当前网页内容提供 AI 总结等服务
- 支持自定义提示词模板来实现不同功能
- 悬浮气泡一键唤起对话窗口

### 2. 配置页面
- OpenAI 格式参数配置（API Key、模型、温度等）
- 参数保存和连接测试功能
- 提示词模板管理（增删改查）
- 默认提示词模板

### 3. 对话窗口
- 通过点击页面右下角悬浮气泡弹出和关闭
- 支持选择提示词模板
- 回答内容流式输出
- Markdown 格式渲染
- 对话内容可保存为历史记录
- 对话历史管理（查看、加载、删除、重命名）

### 4. 其他功能
- 弹出窗口快速访问配置页面
- 快捷键支持（Alt+Shift+A 唤起/隐藏对话窗口，Ctrl+Enter 发送消息）

## 技术架构

### 技术栈
- 前端：HTML/CSS/JavaScript
- 构建工具：Webpack
- Markdown 渲染：markdown-it
- 状态管理：Chrome Storage API
- 网络请求：Fetch API

### 项目结构
```
weainote/
├── manifest.json              # 插件配置文件
├── package.json               # 依赖配置
├── webpack.config.js          # Webpack 配置
├── public/                    # 静态资源
│   ├── icons/                 # 插件图标
│   ├── popup.html             # 弹出窗口
│   └── options.html           # 配置页面
├── src/                       # 源代码
│   ├── background/            # 后台脚本
│   │   └── background.js      # 后台逻辑处理
│   ├── content/               # 内容脚本
│   │   ├── content.js         # 悬浮气泡和对话窗口
│   │   └── content.css        # 样式文件
│   ├── options/               # 配置页面
│   │   ├── options.js         # 配置逻辑
│   │   └── options.css        # 配置页面样式
│   └── popup/                 # 弹出窗口
├── README.md                  # 项目说明
└── dist/                      # 构建输出目录
```

## 使用说明

### 安装步骤
1. 克隆或下载项目代码
2. 在终端中运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建项目
4. 在 Chrome 浏览器中打开 `chrome://extensions/`
5. 开启右上角的"开发者模式"
6. 点击"加载已解压的扩展程序"
7. 选择项目目录进行加载

### 使用方法
1. 点击浏览器工具栏中的 WeAINote 图标打开弹出窗口
2. 点击"打开配置页面"设置 OpenAI API Key 和其他参数
3. 在任意网页中点击右下角的绿色 AI 按钮打开对话窗口
4. 选择需要的提示词模板（可选）
5. 输入问题与 AI 进行交互
6. AI 将基于当前网页内容提供回答

### 快捷键
- `Alt+Shift+A`：唤起/隐藏对话窗口
- `Ctrl+Enter`：在对话窗口输入框中发送消息

## 配置说明

### OpenAI API 参数
- **API Key**：OpenAI API 密钥，用于访问 AI 服务
- **模型**：选择使用的 AI 模型（如 gpt-3.5-turbo, gpt-4 等）
- **温度**：控制生成文本的随机性，值越高结果越随机
- **最大 Token 数**：限制生成文本的最大长度

### 提示词模板
提示词模板支持以下占位符：
- `{content}`：表示当前网页内容
- `{question}`：表示用户输入的问题

用户可以创建多个提示词模板来实现不同功能，例如：
- 网页摘要：提取网页核心内容
- 内容翻译：将网页内容翻译成指定语言
- 关键点提取：列出网页中的要点信息

## 数据存储

插件使用 Chrome Storage API 存储以下数据：
- 用户配置参数（API Key 等）
- 自定义提示词模板
- 对话历史记录

## 安全性

- API Key 加密存储于浏览器中
- 所有网络请求通过 HTTPS 进行
- 权限最小化原则，只申请必要权限

## 开发指南

### 项目构建
```bash
# 安装依赖
npm install

# 开发模式构建
npm run build

# 生产模式构建
npm run build:prod
```

### 代码结构说明

#### manifest.json
插件的核心配置文件，定义了插件的基本信息、权限和资源。

#### src/background/background.js
后台脚本，负责处理插件的核心逻辑，包括配置管理、API 调用等。

#### src/content/content.js
内容脚本，注入到网页中，负责创建悬浮气泡和对话窗口，处理用户交互。

#### src/content/content.css
内容脚本的样式文件，定义悬浮气泡和对话窗口的外观。

#### public/options.html
配置页面的 HTML 结构。

#### src/options/options.js
配置页面的交互逻辑，包括参数配置、提示词管理等。

#### src/options/options.css
配置页面的样式文件。

#### public/popup.html
插件图标点击时弹出的窗口页面。

## 故障排除

### 常见问题

1. **无法连接到 AI 服务**
   - 检查 API Key 是否正确配置
   - 确认网络连接正常
   - 验证 OpenAI 服务是否可用

2. **对话窗口无法显示**
   - 检查插件是否已启用
   - 确认页面是否允许脚本执行
   - 尝试刷新页面后重试

3. **提示词模板不生效**
   - 检查模板语法是否正确
   - 确认占位符是否正确使用
   - 验证模板是否已保存

### 日志查看
在 Chrome 扩展管理页面点击"检查视图"可以查看插件运行日志，帮助诊断问题。

## 扩展性考虑
1. 支持多种 AI 服务提供商（OpenAI、Azure OpenAI、Claude 等）
2. 插件主题自定义
3. 多语言支持
4. 导出/导入配置功能