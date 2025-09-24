// 导入 markdown-it 库用于 Markdown 渲染
// 由于内容脚本的限制，我们需要在页面中动态加载
let markdownit = null;

// 当前对话历史
let currentChatHistory = {
    id: null,
    timestamp: null,
    messages: []
};

// 当前选择的提示词
let currentPrompt = null;

// 快捷键配置
const shortcuts = {
    toggleDialog: 'Alt+Shift+A',  // 切换对话窗口
    sendMessage: 'Ctrl+Enter'     // 发送消息
};

// 动态加载 markdown-it 库
function loadMarkdownIt() {
    return new Promise((resolve, reject) => {
        if (markdownit) {
            resolve(markdownit);
            return;
        }
        
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('lib/markdown-it.min.js');
        script.onload = () => {
            markdownit = window.markdownit({
                html: false,
                xhtmlOut: false,
                breaks: false,
                langPrefix: 'language-',
                linkify: true,
                typographer: true,
                quotes: '“”‘’'
            });
            resolve(markdownit);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 注入悬浮气泡和对话窗口
(function() {
    // 创建悬浮按钮
    function createFloatButton() {
        const floatButton = document.createElement('div');
        floatButton.className = 'weainote-float-button';
        floatButton.id = 'weainote-float-button';
        document.body.appendChild(floatButton);
        
        // 绑定点击事件
        floatButton.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡到document
            toggleDialog();
        });
    }
    
    // 创建对话窗口
    function createDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'weainote-dialog hidden';
        dialog.id = 'weainote-dialog';
        dialog.innerHTML = `
            <div class="weainote-dialog-header">
                <h3 class="weainote-dialog-title">WeAINote</h3>
                <div class="weainote-dialog-controls">
                    <button class="weainote-dialog-history-btn" id="weainote-history-btn">历史</button>
                    <select id="weainote-prompt-select" class="weainote-prompt-select">
                        <option value="">选择提示词</option>
                    </select>
                </div>
            </div>
            <div class="weainote-dialog-messages" id="weainote-dialog-messages">
                <div class="weainote-message weainote-ai-message">
                    <div class="weainote-markdown-content">您好！我是 WeAINote，可以帮助您总结网页内容。请问有什么可以帮助您的吗？</div>
                </div>
            </div>
            <div class="weainote-dialog-input">
                <input type="text" class="weainote-input-field" id="weainote-input-field" placeholder="输入您的问题...">
                <button class="weainote-send-button" id="weainote-send-button">发送</button>
                <button class="weainote-save-button" id="weainote-save-button">保存</button>
            </div>
        `;
        document.body.appendChild(dialog);
        
        // 绑定事件
        document.getElementById('weainote-send-button').addEventListener('click', sendMessage);
        document.getElementById('weainote-input-field').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.ctrlKey) {
                sendMessage();
            }
        });
        document.getElementById('weainote-save-button').addEventListener('click', saveConversation);
        document.getElementById('weainote-history-btn').addEventListener('click', showHistory);
        document.getElementById('weainote-prompt-select').addEventListener('change', handlePromptSelect);
        
        // 加载提示词模板
        loadPromptTemplates();
    }
    
    // 加载提示词模板
    function loadPromptTemplates() {
        chrome.runtime.sendMessage({
            type: 'GET_CONFIG'
        }, (response) => {
            if (response.success && response.data.prompts) {
                const promptSelect = document.getElementById('weainote-prompt-select');
                const prompts = response.data.prompts;
                
                // 清空现有选项
                promptSelect.innerHTML = '<option value="">选择提示词模板</option>';
                
                // 添加提示词选项
                prompts.forEach(prompt => {
                    const option = document.createElement('option');
                    option.value = prompt.id;
                    option.textContent = prompt.title;
                    promptSelect.appendChild(option);
                });
                
                // 不再默认选择任何提示词，保持空白选项选中
                // 确保发送按钮默认可用
                const sendButton = document.getElementById('weainote-send-button');
                if (sendButton) {
                    sendButton.disabled = false;
                }
            }
        });
    }
    
    // 处理提示词选择
    function handlePromptSelect() {
        const promptId = document.getElementById('weainote-prompt-select').value;
        
        if (!promptId) {
            currentPrompt = null;
            return;
        }
        
        // 获取选中的提示词
        chrome.runtime.sendMessage({
            type: 'GET_CONFIG'
        }, (response) => {
            if (response.success && response.data.prompts) {
                const prompts = response.data.prompts;
                currentPrompt = prompts.find(prompt => prompt.id == promptId) || null;
                
                // 确保发送按钮可用
                const sendButton = document.getElementById('weainote-send-button');
                if (sendButton) {
                    sendButton.disabled = false;
                }
            }
        });
    }
    
    // 显示对话历史
    function showHistory() {
        // 发送消息到后台脚本获取历史记录
        chrome.runtime.sendMessage({
            type: 'GET_HISTORY'
        }, (response) => {
            if (response.success) {
                displayHistory(response.data);
            } else {
                alert('获取历史记录失败：' + response.error);
            }
        });
    }
    
    // 显示历史记录界面
    function displayHistory(history) {
        const messagesContainer = document.getElementById('weainote-dialog-messages');
        messagesContainer.innerHTML = '';
        
        if (history.length === 0) {
            messagesContainer.innerHTML = '<div class="weainote-message weainote-ai-message"><div class="weainote-markdown-content">暂无历史记录</div></div>';
            return;
        }
        
        // 显示历史记录列表
        const historyList = document.createElement('div');
        historyList.className = 'weainote-history-list';
        historyList.innerHTML = '<h4>对话历史</h4>';
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'weainote-history-item';
            const date = new Date(item.timestamp).toLocaleString();
            
            // 如果有名称则显示名称，否则显示日期
            const displayName = item.name || date;
            
            historyItem.innerHTML = `
                <div class="weainote-history-item-header">
                    <span class="weainote-history-name" data-id="${item.id}" title="点击编辑名称">${displayName}</span>
                    <div class="weainote-history-actions">
                        <button class="weainote-history-load" data-id="${item.id}">加载</button>
                        <button class="weainote-history-delete" data-id="${item.id}">删除</button>
                    </div>
                </div>
                <div class="weainote-history-preview">
                    ${item.messages.length > 0 ? item.messages[0].content.substring(0, 50) + '...' : '空对话'}
                </div>
            `;
            historyList.appendChild(historyItem);
        });
        
        messagesContainer.appendChild(historyList);
        
        // 绑定历史记录操作事件
        document.querySelectorAll('.weainote-history-load').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                loadConversation(id);
            });
        });
        
        document.querySelectorAll('.weainote-history-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteConversation(id);
            });
        });
        
        // 绑定历史记录名称修改事件
        document.querySelectorAll('.weainote-history-name').forEach(nameElement => {
            // 保存原始名称
            const originalName = nameElement.textContent;
            
            // 添加提示信息
            nameElement.setAttribute('title', '点击编辑名称');
            
            // 双击时进入编辑状态
            nameElement.addEventListener('dblclick', function() {
                this.setAttribute('contenteditable', 'true');
                this.focus();
                
                // 选中所有文本
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(this);
                selection.removeAllRanges();
                selection.addRange(range);
            });
            
            // 失去焦点时保存修改
            nameElement.addEventListener('blur', function() {
                // 退出编辑状态
                this.removeAttribute('contenteditable');
                
                const id = this.getAttribute('data-id');
                const newName = this.textContent.trim();
                
                // 如果名称为空，恢复为日期
                if (!newName) {
                    const item = history.find(item => item.id == id);
                    if (item) {
                        const date = new Date(item.timestamp).toLocaleString();
                        this.textContent = date;
                    }
                    return;
                }
                
                // 如果名称没有改变，不需要保存
                if (newName === originalName) {
                    return;
                }
                
                // 保存修改后的名称
                updateConversationName(id, newName);
            });
            
            // 按回车键时保存修改
            nameElement.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur(); // 触发失去焦点事件
                }
            });
        });
    }
    
    // 加载对话
    function loadConversation(id) {
        chrome.runtime.sendMessage({
            type: 'GET_HISTORY'
        }, (response) => {
            if (response.success) {
                const history = response.data;
                const conversation = history.find(item => item.id == id);
                if (conversation) {
                    currentChatHistory = conversation;
                    renderConversation(conversation.messages);
                }
            }
        });
    }
    
    // 删除对话
    function deleteConversation(id) {
        if (!confirm('确定要删除这条对话记录吗？')) return;
        
        chrome.runtime.sendMessage({
            type: 'DELETE_HISTORY',
            data: { id: id }
        }, (response) => {
            if (response.success) {
                showHistory(); // 重新显示历史记录
            } else {
                alert('删除失败：' + response.error);
            }
        });
    }
    
    // 更新对话历史名称
    function updateConversationName(id, newName) {
        // 发送消息到后台脚本更新历史记录名称
        chrome.runtime.sendMessage({
            type: 'UPDATE_HISTORY_NAME',
            data: { id: id, name: newName }
        }, (response) => {
            if (!response.success) {
                console.error('更新历史记录名称失败：' + response.error);
            }
        });
    }
    
    // 渲染对话
    function renderConversation(messages) {
        const messagesContainer = document.getElementById('weainote-dialog-messages');
        messagesContainer.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `weainote-message weainote-${message.role === 'user' ? 'user' : 'ai'}-message`;
            
            if (message.role !== 'user') {
                // 对于 AI 消息，使用 Markdown 渲染
                loadMarkdownIt().then((md) => {
                    messageElement.innerHTML = `<div class="weainote-markdown-content">${md.render(message.content)}</div>`;
                }).catch(() => {
                    // 如果 Markdown 渲染失败，使用简单渲染
                    messageElement.innerHTML = `<div class="weainote-markdown-content">${renderSimpleMarkdown(message.content)}</div>`;
                });
            } else {
                messageElement.textContent = message.content;
            }
            
            messagesContainer.appendChild(messageElement);
        });
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 保存当前对话
    function saveConversation() {
        if (currentChatHistory.messages.length === 0) {
            alert('没有对话内容可保存');
            return;
        }
        
        // 如果是新对话，生成ID和时间戳
        if (!currentChatHistory.id) {
            currentChatHistory.id = 'chat_' + Date.now();
            currentChatHistory.timestamp = Date.now();
        }
        
        // 发送消息到后台脚本保存历史记录
        chrome.runtime.sendMessage({
            type: 'SAVE_HISTORY',
            data: currentChatHistory
        }, (response) => {
            if (response.success) {
                alert('对话已保存');
            } else {
                alert('保存失败：' + response.error);
            }
        });
    }
    
    // 显示/隐藏对话窗口
    function toggleDialog() {
        const dialog = document.getElementById('weainote-dialog');
        if (dialog.classList.contains('hidden')) {
            showDialog();
        } else {
            hideDialog();
        }
    }
    
    // 显示对话窗口
    function showDialog() {
        document.getElementById('weainote-dialog').classList.remove('hidden');
        document.getElementById('weainote-input-field').focus();
        
        // 添加点击外部隐藏对话框的事件监听器
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 0);
    }
    
    // 隐藏对话窗口
    function hideDialog() {
        document.getElementById('weainote-dialog').classList.add('hidden');
        
        // 移除点击外部隐藏对话框的事件监听器
        document.removeEventListener('click', handleOutsideClick);
    }
    
    // 处理点击对话框外部的事件
    function handleOutsideClick(e) {
        const dialog = document.getElementById('weainote-dialog');
        if (dialog && !dialog.contains(e.target) && !dialog.classList.contains('hidden')) {
            // 检查点击的元素是否是悬浮按钮
            const floatButton = document.getElementById('weainote-float-button');
            if (floatButton && floatButton.contains(e.target)) {
                return; // 如果点击的是悬浮按钮，则不隐藏对话框
            }
            hideDialog();
        }
    }
    
    // 发送消息
    function sendMessage() {
        const inputField = document.getElementById('weainote-input-field');
        const message = inputField.value.trim();
        
        // 不再检查消息是否为空，允许空消息发送
        // 添加用户消息到对话窗口和历史记录
        addMessageToUI(message || '', 'user');
        addMessageToHistory(message || '', 'user');
        
        // 清空输入框
        inputField.value = '';
        
        // 调用 AI API
        callAI_API(message);
    }
    
    // 调用 AI API
    function callAI_API(userMessage) {
        // 获取当前网页内容
        const pageContent = document.body.innerText || document.body.textContent;
        
        // 获取系统提示词
        chrome.runtime.sendMessage({
            type: 'GET_CONFIG'
        }, (configResponse) => {
            // 构造消息历史
            let messages = [];
            
            // 获取系统提示词，默认使用固定的系统提示词
            let systemPrompt = "你是一个网页内容分析助手，能够根据用户的需求分析网页内容并提供有用的信息。";
            
            // 如果配置中有系统提示词，则使用配置中的
            if (configResponse.success && configResponse.data.systemPrompt) {
                systemPrompt = configResponse.data.systemPrompt;
            }
            
            if (currentPrompt) {
                // 使用选中的提示词模板
                const promptContent = currentPrompt.content.replace('{content}', pageContent.substring(0, 2000)).replace('{question}', userMessage);
                
                messages = [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: promptContent
                    }
                ];
            } else {
                // 使用默认提示词
                // 根据用户是否输入问题来调整提示词内容
                let userContent = `请分析以下网页内容：

${pageContent.substring(0, 2000)}`;
                
                if (userMessage) {
                    userContent += `

用户问题：${userMessage}`;
                }
                
                messages = [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userContent
                    }
                ];
            }
            
            // 显示正在思考的状态
            showThinkingStatus();
            
            // 发送消息到后台脚本
            chrome.runtime.sendMessage({
                type: 'CALL_AI_API',
                data: { messages: messages }
            }, (response) => {
                if (response.success) {
                    // 显示 AI 回复
                    const aiResponse = response.data.choices[0].message.content;
                    streamMessage(aiResponse);
                    addMessageToHistory(aiResponse, 'assistant');
                } else {
                    // 显示错误信息
                    addMessageToUI(`错误：${response.error}`, 'ai');
                    addMessageToHistory(`错误：${response.error}`, 'assistant');
                }
            });
        });
    }
    
    // 显示正在思考的状态
    function showThinkingStatus() {
        const messagesContainer = document.getElementById('weainote-dialog-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'weainote-message weainote-ai-message';
        messageElement.id = 'thinking-message';
        messageElement.innerHTML = `
            <div class="weainote-markdown-content">
                <div class="thinking-animation">
                    <span>正在思考中</span>
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(messageElement);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 隐藏正在思考的状态
    function hideThinkingStatus() {
        const thinkingMessage = document.getElementById('thinking-message');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
    }
    
    // 添加消息到界面
    function addMessageToUI(content, sender) {
        const messagesContainer = document.getElementById('weainote-dialog-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `weainote-message weainote-${sender}-message`;
        
        if (sender !== 'user') {
            // 对于 AI 消息，使用 Markdown 渲染
            loadMarkdownIt().then((md) => {
                messageElement.innerHTML = `<div class="weainote-markdown-content">${md.render(content)}</div>`;
            }).catch(() => {
                // 如果 Markdown 渲染失败，使用简单渲染
                messageElement.innerHTML = `<div class="weainote-markdown-content">${renderSimpleMarkdown(content)}</div>`;
            });
        } else {
            messageElement.textContent = content;
        }
        
        messagesContainer.appendChild(messageElement);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 添加消息到历史记录
    function addMessageToHistory(content, role) {
        currentChatHistory.messages.push({
            role: role,
            content: content,
            timestamp: Date.now()
        });
        
        // 如果是新对话，初始化ID和时间戳
        if (!currentChatHistory.id) {
            currentChatHistory.id = 'chat_' + Date.now();
            currentChatHistory.timestamp = Date.now();
        }
    }
    
    // 流式输出消息
    function streamMessage(content) {
        // 隐藏思考状态
        hideThinkingStatus();
        
        const messagesContainer = document.getElementById('weainote-dialog-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'weainote-message weainote-ai-message';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'weainote-markdown-content';
        messageElement.appendChild(contentElement);
        
        messagesContainer.appendChild(messageElement);
        
        // 添加光标元素
        const cursorElement = document.createElement('span');
        cursorElement.className = 'weainote-streaming-cursor';
        messageElement.appendChild(cursorElement);
        
        let index = 0;
        
        // 加载 Markdown 渲染器
        loadMarkdownIt().then((md) => {
            const interval = setInterval(() => {
                if (index < content.length) {
                    contentElement.innerHTML = md.render(content.substring(0, index + 1));
                    index++;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } else {
                    // 移除光标
                    cursorElement.remove();
                    clearInterval(interval);
                }
            }, 20);
        }).catch(() => {
            // 如果 Markdown 渲染失败，使用简单渲染
            const interval = setInterval(() => {
                if (index < content.length) {
                    contentElement.innerHTML = renderSimpleMarkdown(content.substring(0, index + 1));
                    index++;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } else {
                    // 移除光标
                    cursorElement.remove();
                    clearInterval(interval);
                }
            }, 20);
        });
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 简单的 Markdown 渲染函数（作为备选方案）
    function renderSimpleMarkdown(text) {
        // 处理粗体
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 处理代码块
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // 处理链接
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 处理换行
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // 快捷键处理
    function handleShortcut(event) {
        // 检查是否按下了切换对话窗口的快捷键
        if (event.altKey && event.shiftKey && event.key === 'A') {
            event.preventDefault();
            toggleDialog();
            return;
        }
        
        // 检查是否在输入框中按下了发送消息的快捷键
        const inputField = document.getElementById('weainote-input-field');
        if (inputField && document.activeElement === inputField && event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
            return;
        }
    }
    
    // 初始化
    function init() {
        // 确保只在主页面中注入（避免在 iframe 中重复注入）
        if (window.self !== window.top) return;
        
        // 创建悬浮按钮和对话窗口
        createFloatButton();
        createDialog();
        
        // 绑定快捷键事件
        document.addEventListener('keydown', handleShortcut);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();