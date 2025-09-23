# 第三方库目录

此目录用于存放项目依赖的第三方库文件。

## markdown-it
markdown-it 是一个现代化的 Markdown 解析器，用于在插件中渲染 Markdown 格式的内容。

### 使用方法
在内容脚本中通过以下方式动态加载：
```javascript
const script = document.createElement('script');
script.src = chrome.runtime.getURL('lib/markdown-it.min.js');
```

### 安装说明
1. 从 https://github.com/markdown-it/markdown-it 下载最新版本
2. 将 markdown-it.min.js 文件放置在此目录中