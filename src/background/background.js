// 后台脚本 - 处理插件的核心逻辑

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
    // 根据消息类型处理
    switch (request.type) {
        case 'GET_CONFIG':
            // 获取配置信息
            getConfig().then(config => {
                sendResponse({ success: true, data: config });
            });
            return true; // 保持消息通道开放以进行异步响应
            
        case 'SAVE_CONFIG':
            // 保存配置信息
            saveConfig(request.data).then(() => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'CALL_AI_API':
            // 调用 AI API
            callAIApi(request.data).then(response => {
                sendResponse({ success: true, data: response });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'GET_HISTORY':
            // 获取对话历史
            getHistory().then(history => {
                sendResponse({ success: true, data: history });
            });
            return true;
            
        case 'SAVE_HISTORY':
            // 保存对话历史
            saveHistory(request.data).then(() => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'DELETE_HISTORY':
            // 删除对话历史
            deleteHistory(request.data.id).then(() => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'CLEAR_HISTORY':
            // 清空对话历史
            clearHistory().then(() => {
                sendResponse({ success: true });
            });
            return true;
            
        default:
            sendResponse({ success: false, error: '未知的消息类型' });
    }
});

// 获取配置信息
async function getConfig() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([
            'apiUrl',
            'apiKey', 
            'model', 
            'temperature', 
            'maxTokens',
            'categories',
            'prompts'
        ], (result) => {
            resolve({
                apiUrl: result.apiUrl || 'https://api.openai.com/v1/chat/completions',
                apiKey: result.apiKey || '',
                model: result.model || 'gpt-3.5-turbo',
                temperature: result.temperature || 0.7,
                maxTokens: result.maxTokens || 1024,
                categories: result.categories || [],
                prompts: result.prompts || []
            });
        });
    });
}

// 保存配置信息
async function saveConfig(config) {
    return new Promise((resolve) => {
        chrome.storage.sync.set(config, () => {
            resolve();
        });
    });
}

// 调用 AI API
async function callAIApi(data) {
    try {
        // 获取配置
        const config = await getConfig();
        
        if (!config.apiKey) {
            throw new Error('API Key 未配置');
        }
        
        if (!config.apiUrl) {
            throw new Error('API URL 未配置');
        }
        
        if (!config.model) {
            throw new Error('模型未配置');
        }
        
        const requestBody = {
            model: config.model,
            messages: data.messages,
            temperature: parseFloat(config.temperature),
            max_tokens: parseInt(config.maxTokens)
        };
        
        const response = await fetchWithTimeout(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(requestBody)
        }, 30000); // 30秒超时
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API 请求失败: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 调用错误:', error);
        throw error;
    }
}

// 带超时的 fetch 函数
function fetchWithTimeout(url, options, timeout) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('请求超时')), timeout)
        )
    ]);
}

// 获取对话历史
async function getHistory() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['chatHistory'], (result) => {
            resolve(result.chatHistory || []);
        });
    });
}

// 保存对话历史
async function saveHistory(historyItem) {
    // 获取现有历史记录
    const history = await getHistory();
    
    // 查找是否已存在相同ID的记录
    const existingIndex = history.findIndex(item => item.id === historyItem.id);
    
    if (existingIndex >= 0) {
        // 更新现有记录
        history[existingIndex] = historyItem;
    } else {
        // 添加新记录
        history.push(historyItem);
    }
    
    // 保存更新后的历史记录
    return new Promise((resolve) => {
        chrome.storage.local.set({ chatHistory: history }, () => {
            resolve();
        });
    });
}

// 删除对话历史
async function deleteHistory(id) {
    // 获取现有历史记录
    const history = await getHistory();
    
    // 过滤掉要删除的记录
    const updatedHistory = history.filter(item => item.id !== id);
    
    // 保存更新后的历史记录
    return new Promise((resolve) => {
        chrome.storage.local.set({ chatHistory: updatedHistory }, () => {
            resolve();
        });
    });
}

// 清空对话历史
async function clearHistory() {
    return new Promise((resolve) => {
        chrome.storage.local.set({ chatHistory: [] }, () => {
            resolve();
        });
    });
}

// 监听插件安装事件
chrome.runtime.onInstalled.addListener(() => {
    console.log('WeAINote 插件已安装');
    
    // 初始化默认配置
    initializeDefaultConfig();
});

// 初始化默认配置
function initializeDefaultConfig() {
    chrome.storage.sync.get([
        'apiUrl',
        'apiKey', 
        'model', 
        'temperature', 
        'maxTokens',
        'categories',
        'prompts'
    ], (result) => {
        // 如果没有配置，设置默认值
        const defaultConfig = {};
        
        if (result.apiUrl === undefined) {
            defaultConfig.apiUrl = 'https://api.openai.com/v1/chat/completions';
        }
        
        if (result.apiKey === undefined) {
            defaultConfig.apiKey = '';
        }
        
        if (result.model === undefined) {
            defaultConfig.model = 'gpt-3.5-turbo';
        }
        
        if (result.temperature === undefined) {
            defaultConfig.temperature = 0.7;
        }
        
        if (result.maxTokens === undefined) {
            defaultConfig.maxTokens = 1024;
        }
        
        if (result.categories === undefined) {
            defaultConfig.categories = [
                { id: 1, name: '网页总结' },
                { id: 2, name: '内容翻译' },
                { id: 3, name: '关键点提取' },
                { id: 4, name: '问答助手' },
                { id: 5, name: '写作辅助' }
            ];
        }
        
        if (result.prompts === undefined) {
            defaultConfig.prompts = [
                {
                    id: 1,
                    categoryId: 1,
                    title: '总结网页内容',
                    content: '请总结以下网页内容，提取主要观点和关键信息：\n\n{content}'
                },
                {
                    id: 2,
                    categoryId: 2,
                    title: '翻译为中文',
                    content: '请将以下内容翻译为中文：\n\n{content}'
                },
                {
                    id: 3,
                    categoryId: 3,
                    title: '提取关键点',
                    content: '请从以下内容中提取5个关键点：\n\n{content}'
                },
                {
                    id: 4,
                    categoryId: 4,
                    title: '解答问题',
                    content: '请基于以下网页内容回答用户的问题：\n\n{content}\n\n用户问题：{question}'
                },
                {
                    id: 5,
                    categoryId: 4,
                    title: '解释概念',
                    content: '请解释以下内容中的专业概念或术语：\n\n{content}'
                },
                {
                    id: 6,
                    categoryId: 5,
                    title: '改写文本',
                    content: '请改写以下文本，使其更加流畅和易读：\n\n{content}'
                },
                {
                    id: 7,
                    categoryId: 5,
                    title: '生成大纲',
                    content: '请为以下内容生成一个结构化的大纲：\n\n{content}'
                }
            ];
        }
        
        if (Object.keys(defaultConfig).length > 0) {
            chrome.storage.sync.set(defaultConfig, () => {
                console.log('默认配置已初始化');
            });
        }
    });
}