# WeAINote Chrome 插件开发文档

## 项目概述

WeAINote 是一个基于 Chrome 浏览器的插件，主要功能是基于当前网页内容提供 AI 总结等服务。用户可以通过配置不同的提示词模板来实现不同的功能，如网页摘要、内容翻译、关键点提取等。

## 功能需求

### 1. 核心功能
- 基于当前网页内容提供 AI 总结等服务
- 支持根据提示词定义不同功能

### 2. 配置画面
- 支持 OpenAI 格式的参数设定（API Key、模型、温度等）
- 支持参数保存和测试功能
- 支持提示词的分类管理和内容指定

### 3. 对话画面
- 通过点击悬浮气泡弹出和关闭
- 回答内容流式输出
- 支持 Markdown 格式渲染
- 对话内容可选择保存为历史记录

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

## 详细设计

### 1. manifest.json 配置
- 定义插件基本信息（名称、版本、描述等）
- 声明权限（storage、activeTab、scripting等）
- 注册后台脚本、内容脚本、弹出窗口、配置页面

### 2. 配置页面 (Options Page)
#### 功能模块
- OpenAI API 参数配置
  - API Key 输入（加密存储）
  - 模型选择（gpt-3.5-turbo, gpt-4等）
  - 温度参数设置
  - 最大 token 数设置
- 提示词管理
  - 分类管理（添加、编辑、删除分类）
  - 提示词模板管理（增删改查）
  - 默认提示词模板
- 测试功能
  - API 连通性测试
  - 提示词效果测试

#### 界面设计
- 表单布局，支持参数输入和保存
- 测试按钮和结果显示区域
- 提示词分类列表和内容编辑区域

### 3. 悬浮气泡和对话窗口
#### 功能模块
- 悬浮气泡
  - 固定在页面右下角
  - 点击展开/收起对话窗口
  - 可拖拽移动位置
- 对话窗口
  - 显示对话历史
  - 输入框发送消息
  - 流式输出 AI 回复
  - Markdown 渲染支持
  - 保存对话历史选项

#### 界面设计
- 悬浮按钮设计
- 对话窗口布局（消息列表、输入框、操作按钮）
- 消息气泡样式（用户消息、AI回复）
- Markdown 渲染样式

### 4. 后台脚本 (Background Script)
- 管理插件状态
- 处理 API 请求
- 管理存储数据
- 监听浏览器事件

### 5. 内容脚本 (Content Script)
- 注入到网页中
- 创建和管理悬浮气泡
- 获取当前网页内容
- 与后台脚本通信

### 6. 数据存储
- 使用 Chrome Storage API
- 存储配置参数
- 存储提示词模板
- 存储对话历史

### 7. API 集成
- OpenAI API 接口调用
- 流式响应处理
- 错误处理和重试机制

## 开发计划

### 第一阶段：项目初始化和基础架构
1. 创建项目结构
2. 配置 manifest.json
3. 实现基础的后台脚本和内容脚本
4. 创建悬浮气泡基础界面

### 第二阶段：配置页面开发
1. 设计配置页面 UI
2. 实现 OpenAI 参数配置和存储
3. 实现提示词分类和模板管理
4. 添加测试功能

### 第三阶段：对话功能开发
1. 完善悬浮气泡交互
2. 实现对话窗口界面
3. 集成 Markdown 渲染
4. 实现流式输出功能

### 第四阶段：数据存储和历史记录
1. 实现配置数据持久化
2. 实现对话历史存储
3. 添加历史记录管理功能

### 第五阶段：测试和优化
1. 功能测试
2. 性能优化
3. 用户体验优化
4. 打包发布准备

## 安全考虑
- API Key 加密存储
- 内容安全策略配置
- 权限最小化原则
- 输入验证和输出转义

## 用户体验
- 简洁直观的界面设计
- 快速响应的交互反馈
- 清晰的错误提示信息
- 便捷的操作流程

## 安装和使用说明

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
4. 输入问题与 AI 进行交互
5. AI 将基于当前网页内容提供回答

## 项目文件说明

### manifest.json
插件的核心配置文件，定义了插件的基本信息、权限和资源。

### src/background/background.js
后台脚本，负责处理插件的核心逻辑，包括配置管理、API 调用等。

### src/content/content.js
内容脚本，注入到网页中，负责创建悬浮气泡和对话窗口，处理用户交互。

### src/content/content.css
内容脚本的样式文件，定义悬浮气泡和对话窗口的外观。

### public/options.html
配置页面的 HTML 结构。

### src/options/options.js
配置页面的交互逻辑，包括参数配置、提示词管理等。

### src/options/options.css
配置页面的样式文件。

### public/popup.html
插件图标点击时弹出的窗口页面。

## API 接口设计

### 配置管理接口
- `GET_CONFIG`: 获取插件配置
- `SAVE_CONFIG`: 保存插件配置

### AI 服务接口
- `CALL_AI_API`: 调用 AI API 获取回答

## 数据结构设计

### 配置数据结构
```javascript
{
  apiKey: string,        // API 密钥
  model: string,         // 模型名称
  temperature: number,   // 温度参数
  maxTokens: number,     // 最大 token 数
  categories: Array,     // 提示词分类
  prompts: Array         // 提示词模板
}
```

### 提示词分类结构
```javascript
{
  id: number,            // 分类 ID
  name: string           // 分类名称
}
```

### 提示词模板结构
```javascript
{
  id: number,            // 模板 ID
  categoryId: number,    // 所属分类 ID
  title: string,         // 模板标题
  content: string        // 模板内容
}
```

### 对话历史结构
```javascript
{
  id: string,            // 对话 ID
  timestamp: number,     // 时间戳
  messages: Array        // 消息列表
}
```

## 扩展性考虑
1. 支持多种 AI 服务提供商（OpenAI、Azure OpenAI、Claude 等）
2. 插件主题自定义
3. 快捷键支持
4. 多语言支持
5. 导出/导入配置功能