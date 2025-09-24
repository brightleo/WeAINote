// 语言包
let currentLanguage = 'zh-CN';
const locales = {
    'zh-CN': {},
    'en': {}
};

// 加载语言包
function loadLocales() {
    // 在实际实现中，这里会从 locales 目录加载语言包
    // 为了简化，我们直接在代码中定义
    locales['zh-CN'] = {
        configPageTitle: 'WeAINote 配置',
        aiServiceConfig: 'AI 服务配置',
        apiUrl: 'API URL',
        apiKey: 'API Key',
        model: '模型',
        temperature: '温度',
        maxTokens: '最大 Token 数',
        testConnection: '测试连接',
        dataManagement: '数据管理',
        exportConfig: '导出配置',
        importConfig: '导入配置',
        promptManagement: '提示词管理',
        systemPrompts: '系统提示词',
        promptTemplate: '提示词模板',
        addPrompt: '添加提示词',
        saveConfig: '保存配置'
    };
    
    locales['en'] = {
        configPageTitle: 'WeAINote Configuration',
        aiServiceConfig: 'AI Service Configuration',
        apiUrl: 'API URL',
        apiKey: 'API Key',
        model: 'Model',
        temperature: 'Temperature',
        maxTokens: 'Max Tokens',
        testConnection: 'Test Connection',
        dataManagement: 'Data Management',
        exportConfig: 'Export Configuration',
        importConfig: 'Import Configuration',
        promptManagement: 'Prompt Management',
        systemPrompts: 'System Prompts',
        promptTemplate: 'Prompt Template',
        addPrompt: 'Add Prompt',
        saveConfig: 'Save Configuration'
    };
}

// 获取翻译文本
function getMessage(key) {
    return locales[currentLanguage][key] || key;
}

// 更新界面语言
function updateUILanguage() {
    // 更新页面标题
    document.title = getMessage('configPageTitle');
    
    // 更新页面中的文本元素
    document.querySelector('h1').textContent = getMessage('configPageTitle');
    
    // 更新Tab标签文本
    document.querySelector('[data-tab="ai-config"]').textContent = getMessage('aiServiceConfig');
    document.querySelector('[data-tab="prompt-config"]').textContent = getMessage('promptManagement');
    
    // 更新标签文本
    document.querySelector('label[for="api-url"]').textContent = getMessage('apiUrl');
    document.querySelector('label[for="api-key"]').textContent = getMessage('apiKey');
    document.querySelector('label[for="model"]').textContent = getMessage('model');
    document.querySelector('label[for="temperature"]').textContent = getMessage('temperature');
    document.querySelector('label[for="max-tokens"]').textContent = getMessage('maxTokens');
    
    // 更新按钮文本
    document.getElementById('test-api').textContent = getMessage('testConnection');
    
    // 更新数据管理部分
    document.querySelectorAll('h2')[1].textContent = getMessage('dataManagement');
    document.getElementById('export-config').textContent = getMessage('exportConfig');
    document.getElementById('import-config').textContent = getMessage('importConfig');
    
    // 更新提示词管理部分
    document.querySelectorAll('h3')[0].textContent = getMessage('systemPrompts');
    document.querySelectorAll('h3')[1].textContent = getMessage('promptTemplate');
    document.getElementById('add-prompt').textContent = getMessage('addPrompt');
    
    // 更新底部保存按钮
    document.getElementById('save-config-bottom').textContent = getMessage('saveConfig');
}

// API 配置相关函数
document.addEventListener('DOMContentLoaded', function() {
    // 加载语言包
    loadLocales();
    
    // 加载已保存的语言设置
    loadLanguageSetting();
    
    // 加载已保存的配置
    loadConfig();
    
    // 绑定Tab切换事件
    bindTabEvents();
    
    // 绑定事件监听器
    document.getElementById('api-config-form').addEventListener('submit', function(e) { e.preventDefault(); });
    document.getElementById('test-api').addEventListener('click', testApiConnection);
    document.getElementById('temperature').addEventListener('input', updateTemperatureValue);
    document.getElementById('add-prompt').addEventListener('click', showAddPromptModal);
    document.getElementById('export-config').addEventListener('click', exportConfig);
    document.getElementById('import-config').addEventListener('click', triggerImportConfig);
    document.getElementById('import-file').addEventListener('change', importConfig);
    document.getElementById('language').addEventListener('change', changeLanguage);
    document.getElementById('save-config-bottom').addEventListener('click', saveConfig);
    
    // 加载提示词
    loadPrompts();
});

// 绑定Tab切换事件
function bindTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新活动Tab按钮
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新活动Tab内容
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// 加载语言设置
function loadLanguageSetting() {
    chrome.storage.sync.get(['language'], function(result) {
        if (result.language) {
            currentLanguage = result.language;
            document.getElementById('language').value = currentLanguage;
            updateUILanguage();
        }
    });
}

// 更改语言
function changeLanguage() {
    currentLanguage = document.getElementById('language').value;
    
    // 保存语言设置
    chrome.storage.sync.set({ language: currentLanguage }, function() {
        updateUILanguage();
    });
}

// 更新温度值显示
function updateTemperatureValue() {
    document.getElementById('temperature-value').textContent = document.getElementById('temperature').value;
}

// 加载配置
function loadConfig() {
    chrome.storage.sync.get([
        'apiUrl',
        'apiKey', 
        'model', 
        'temperature', 
        'maxTokens'
        // 注意：systemPrompt 不在这里加载，因为它在系统提示词编辑模态框中处理
    ], function(result) {
        if (result.apiUrl) document.getElementById('api-url').value = result.apiUrl;
        if (result.apiKey) document.getElementById('api-key').value = result.apiKey;
        if (result.model) document.getElementById('model').value = result.model;
        if (result.temperature) {
            document.getElementById('temperature').value = result.temperature;
            document.getElementById('temperature-value').textContent = result.temperature;
        }
        if (result.maxTokens) document.getElementById('max-tokens').value = result.maxTokens;
        // systemPrompt 不在这里处理
    });
}

// 保存配置
function saveConfig() {
    const config = {
        apiUrl: document.getElementById('api-url').value,
        apiKey: document.getElementById('api-key').value,
        model: document.getElementById('model').value,
        temperature: document.getElementById('temperature').value,
        maxTokens: document.getElementById('max-tokens').value
        // 注意：systemPrompt 不在这里保存，因为它在系统提示词编辑模态框中处理
    };
    
    chrome.storage.sync.set(config, function() {
        alert(currentLanguage === 'zh-CN' ? '配置已保存！' : 'Configuration saved!');
    });
}

// 测试 API 连接
function testApiConnection() {
    // 使用页面当前的数据，而不是保存后的数据
    const apiUrl = document.getElementById('api-url').value;
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model').value;
    const temperature = document.getElementById('temperature').value;
    const maxTokens = document.getElementById('max-tokens').value;
    
    if (!apiUrl) {
        showTestResult(currentLanguage === 'zh-CN' ? '请输入 API URL' : 'Please enter API URL', 'error');
        return;
    }
    
    if (!apiKey) {
        showTestResult(currentLanguage === 'zh-CN' ? '请输入 API Key' : 'Please enter API Key', 'error');
        return;
    }
    
    if (!model) {
        showTestResult(currentLanguage === 'zh-CN' ? '请输入模型名称' : 'Please enter model name', 'error');
        return;
    }
    
    // 这里应该调用实际的 API 测试逻辑
    // 模拟测试过程
    document.getElementById('test-api').disabled = true;
    document.getElementById('test-api').textContent = currentLanguage === 'zh-CN' ? '测试中...' : 'Testing...';
    
    // 发送测试消息到后台脚本，使用页面当前的数据
    chrome.runtime.sendMessage({
        type: 'TEST_AI_API',
        data: {
            apiUrl: apiUrl,
            apiKey: apiKey,
            model: model,
            temperature: parseFloat(temperature),
            maxTokens: parseInt(maxTokens),
            messages: [
                {
                    role: "user",
                    content: "你好"
                }
            ]
        }
    }, (response) => {
        document.getElementById('test-api').disabled = false;
        document.getElementById('test-api').textContent = getMessage('testConnection');
        
        if (response.success) {
            // 显示测试结果弹框
            showTestResultModal(currentLanguage === 'zh-CN' ? 'API 连接成功！' : 'API connection successful!', 'success');
        } else {
            showTestResultModal(`${currentLanguage === 'zh-CN' ? '测试失败：' : 'Test failed: '} ${response.error}`, 'error');
        }
    });
}

// 显示测试结果（用于页面内显示）
function showTestResult(message, type) {
    const resultElement = document.getElementById('test-result');
    resultElement.textContent = message;
    resultElement.className = 'test-result ' + type;
    resultElement.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        resultElement.style.display = 'none';
    }, 3000);
}

// 显示测试结果弹框
function showTestResultModal(message, type) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'result-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header" style="background-color: ${type === 'success' ? '#4CAF50' : '#F44336'}">
                <h3>${currentLanguage === 'zh-CN' ? '测试结果' : 'Test Result'}</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button id="close-result-modal" class="save-btn">${currentLanguage === 'zh-CN' ? '确定' : 'OK'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 绑定事件
    document.querySelector('#result-modal .modal-close').addEventListener('click', closeResultModal);
    document.getElementById('close-result-modal').addEventListener('click', closeResultModal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeResultModal();
        }
    });
}

// 关闭测试结果弹框
function closeResultModal() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.remove();
    }
}

// 导出配置
function exportConfig() {
    // 获取所有配置数据
    chrome.storage.sync.get(null, function(data) {
        // 创建要导出的数据对象
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            config: data
        };
        
        // 创建 Blob 对象
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weainote-config-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });
}

// 触发导入配置
function triggerImportConfig() {
    document.getElementById('import-file').click();
}

// 导入配置
function importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importData.version || !importData.config) {
                showImportResult(currentLanguage === 'zh-CN' ? '无效的配置文件格式' : 'Invalid configuration file format', 'error');
                return;
            }
            
            // 保存导入的配置
            chrome.storage.sync.set(importData.config, function() {
                showImportResult(currentLanguage === 'zh-CN' ? '配置导入成功！' : 'Configuration imported successfully!', 'success');
                
                // 重新加载配置显示
                loadConfig();
                loadPrompts();
            });
        } catch (error) {
            showImportResult(`${currentLanguage === 'zh-CN' ? '配置文件解析失败：' : 'Configuration file parsing failed: '} ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

// 显示导入结果
function showImportResult(message, type) {
    const resultElement = document.getElementById('import-result');
    resultElement.textContent = message;
    resultElement.className = 'test-result ' + type;
    resultElement.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        resultElement.style.display = 'none';
    }, 3000);
}

// 提示词管理相关函数
function loadPrompts() {
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        renderPrompts(prompts);
    });
    
    // 加载系统提示词
    loadSystemPrompts();
}

function loadSystemPrompts() {
    chrome.storage.sync.get(['systemPrompt'], function(result) {
        // 系统提示词是固定的，但可以从存储中获取自定义的系统提示词
        const systemPrompt = result.systemPrompt || '你是一个网页内容分析助手，能够根据用户的需求分析网页内容并提供有用的信息。';
        
        const systemPrompts = [
            {
                id: 'sys1',
                title: '系统提示词',
                content: systemPrompt
            }
        ];
        
        renderSystemPrompts(systemPrompts);
    });
}

function renderSystemPrompts(prompts) {
    const systemPromptList = document.getElementById('system-prompt-list');
    systemPromptList.innerHTML = '';
    
    prompts.forEach((prompt) => {
        const li = document.createElement('li');
        li.className = 'system-prompt-item';
        li.innerHTML = `
            <div>
                <strong>${prompt.title}</strong>
                <div class="prompt-content">${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}</div>
            </div>
            <div class="prompt-actions">
                <button class="edit-btn system-prompt-edit" data-id="${prompt.id}">${currentLanguage === 'zh-CN' ? '编辑' : 'Edit'}</button>
            </div>
        `;
        systemPromptList.appendChild(li);
    });
    
    // 绑定编辑事件
    document.querySelectorAll('.system-prompt-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editSystemPrompt(id);
        });
    });
}

function editSystemPrompt(id) {
    chrome.storage.sync.get(['systemPrompt'], function(result) {
        const systemPrompt = result.systemPrompt || '你是一个网页内容分析助手，能够根据用户的需求分析网页内容并提供有用的信息。';
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'system-prompt-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${currentLanguage === 'zh-CN' ? '编辑系统提示词' : 'Edit System Prompt'}</h3>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="system-prompt-content">${currentLanguage === 'zh-CN' ? '系统提示词内容:' : 'System Prompt Content:'}</label>
                        <textarea id="system-prompt-content" rows="8">${systemPrompt}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="save-system-prompt" class="save-btn">${currentLanguage === 'zh-CN' ? '保存' : 'Save'}</button>
                    <button id="cancel-system-prompt" class="cancel-btn">${currentLanguage === 'zh-CN' ? '取消' : 'Cancel'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 绑定事件
        document.querySelector('#system-prompt-modal .modal-close').addEventListener('click', closeSystemPromptModal);
        document.getElementById('cancel-system-prompt').addEventListener('click', closeSystemPromptModal);
        document.getElementById('save-system-prompt').addEventListener('click', saveSystemPrompt);
        
        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSystemPromptModal();
            }
        });
    });
}

function closeSystemPromptModal() {
    const modal = document.getElementById('system-prompt-modal');
    if (modal) {
        modal.remove();
    }
}

function saveSystemPrompt() {
    const content = document.getElementById('system-prompt-content').value.trim();
    
    if (!content) {
        alert(currentLanguage === 'zh-CN' ? '请输入系统提示词内容' : 'Please enter system prompt content');
        return;
    }
    
    chrome.storage.sync.set({ systemPrompt: content }, function() {
        closeSystemPromptModal();
        loadSystemPrompts();
        alert(currentLanguage === 'zh-CN' ? '系统提示词已保存！' : 'System prompt saved!');
    });
}

function renderPrompts(prompts) {
    const promptList = document.getElementById('prompt-list');
    promptList.innerHTML = '';
    
    prompts.forEach((prompt, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${prompt.title}</strong>
                <div class="prompt-content">${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}</div>
            </div>
            <div class="prompt-actions">
                <button class="edit-btn" data-index="${index}">${currentLanguage === 'zh-CN' ? '编辑' : 'Edit'}</button>
                <button class="delete-btn" data-index="${index}">${currentLanguage === 'zh-CN' ? '删除' : 'Delete'}</button>
            </div>
        `;
        promptList.appendChild(li);
    });
    
    // 绑定编辑和删除事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            editPrompt(index);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deletePrompt(index);
        });
    });
}

function showAddPromptModal() {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'prompt-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${currentLanguage === 'zh-CN' ? '添加提示词模板' : 'Add Prompt Template'}</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="prompt-title">${currentLanguage === 'zh-CN' ? '标题:' : 'Title:'}</label>
                    <input type="text" id="prompt-title" placeholder="${currentLanguage === 'zh-CN' ? '提示词模板标题' : 'Prompt template title'}">
                </div>
                <div class="form-group">
                    <label for="prompt-content">${currentLanguage === 'zh-CN' ? '内容:' : 'Content:'}</label>
                    <textarea id="prompt-content" placeholder="${currentLanguage === 'zh-CN' ? '提示词内容，可以使用 {content} 占位符表示网页内容，{question} 占位符表示用户问题' : 'Prompt content, you can use {content} placeholder to represent web content, {question} placeholder to represent user questions'}" rows="6"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button id="save-prompt" class="save-btn">${currentLanguage === 'zh-CN' ? '保存' : 'Save'}</button>
                <button id="cancel-prompt" class="cancel-btn">${currentLanguage === 'zh-CN' ? '取消' : 'Cancel'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 绑定事件
    document.querySelector('.modal-close').addEventListener('click', closePromptModal);
    document.getElementById('cancel-prompt').addEventListener('click', closePromptModal);
    document.getElementById('save-prompt').addEventListener('click', savePrompt);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePromptModal();
        }
    });
}

function closePromptModal() {
    const modal = document.getElementById('prompt-modal');
    if (modal) {
        modal.remove();
    }
}

function savePrompt() {
    const title = document.getElementById('prompt-title').value.trim();
    const content = document.getElementById('prompt-content').value.trim();
    
    if (!title) {
        alert(currentLanguage === 'zh-CN' ? '请输入提示词标题' : 'Please enter prompt title');
        return;
    }
    
    if (!content) {
        alert(currentLanguage === 'zh-CN' ? '请输入提示词内容' : 'Please enter prompt content');
        return;
    }
    
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        prompts.push({
            id: Date.now(),
            title: title,
            content: content
        });
        
        chrome.storage.sync.set({ prompts: prompts }, function() {
            closePromptModal();
            loadPrompts();
        });
    });
}

function editPrompt(index) {
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        const prompt = prompts[index];
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'prompt-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${currentLanguage === 'zh-CN' ? '编辑提示词模板' : 'Edit Prompt Template'}</h3>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="prompt-title">${currentLanguage === 'zh-CN' ? '标题:' : 'Title:'}</label>
                        <input type="text" id="prompt-title" placeholder="${currentLanguage === 'zh-CN' ? '提示词模板标题' : 'Prompt template title'}" value="${prompt.title}">
                    </div>
                    <div class="form-group">
                        <label for="prompt-content">${currentLanguage === 'zh-CN' ? '内容:' : 'Content:'}</label>
                        <textarea id="prompt-content" placeholder="${currentLanguage === 'zh-CN' ? '提示词内容，可以使用 {content} 占位符表示网页内容，{question} 占位符表示用户问题' : 'Prompt content, you can use {content} placeholder to represent web content, {question} placeholder to represent user questions'}" rows="6">${prompt.content}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="save-prompt" class="save-btn">${currentLanguage === 'zh-CN' ? '保存' : 'Save'}</button>
                    <button id="cancel-prompt" class="cancel-btn">${currentLanguage === 'zh-CN' ? '取消' : 'Cancel'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 绑定事件
        document.querySelector('.modal-close').addEventListener('click', closePromptModal);
        document.getElementById('cancel-prompt').addEventListener('click', closePromptModal);
        document.getElementById('save-prompt').addEventListener('click', function() {
            updatePrompt(index);
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePromptModal();
            }
        });
    });
}

function updatePrompt(index) {
    const title = document.getElementById('prompt-title').value.trim();
    const content = document.getElementById('prompt-content').value.trim();
    
    if (!title) {
        alert(currentLanguage === 'zh-CN' ? '请输入提示词标题' : 'Please enter prompt title');
        return;
    }
    
    if (!content) {
        alert(currentLanguage === 'zh-CN' ? '请输入提示词内容' : 'Please enter prompt content');
        return;
    }
    
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        prompts[index] = {
            id: prompts[index].id,
            title: title,
            content: content
        };
        
        chrome.storage.sync.set({ prompts: prompts }, function() {
            closePromptModal();
            loadPrompts();
        });
    });
}

function deletePrompt(index) {
    if (!confirm(currentLanguage === 'zh-CN' ? '确定要删除这个提示词吗？' : 'Are you sure you want to delete this prompt?')) return;
    
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        prompts.splice(index, 1);
        
        chrome.storage.sync.set({ prompts: prompts }, function() {
            loadPrompts();
        });
    });
}