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
        saveConfig: '保存配置',
        dataManagement: '数据管理',
        exportConfig: '导出配置',
        importConfig: '导入配置',
        promptManagement: '提示词管理',
        categoryManagement: '分类管理',
        newCategory: '新分类名称',
        addCategory: '添加分类',
        promptTemplate: '提示词模板',
        addPrompt: '添加提示词'
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
        saveConfig: 'Save Configuration',
        dataManagement: 'Data Management',
        exportConfig: 'Export Configuration',
        importConfig: 'Import Configuration',
        promptManagement: 'Prompt Management',
        categoryManagement: 'Category Management',
        newCategory: 'New Category Name',
        addCategory: 'Add Category',
        promptTemplate: 'Prompt Template',
        addPrompt: 'Add Prompt'
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
    document.querySelector('h2').textContent = getMessage('aiServiceConfig');
    
    // 更新标签文本
    document.querySelector('label[for="api-url"]').textContent = getMessage('apiUrl');
    document.querySelector('label[for="api-key"]').textContent = getMessage('apiKey');
    document.querySelector('label[for="model"]').textContent = getMessage('model');
    document.querySelector('label[for="temperature"]').textContent = getMessage('temperature');
    document.querySelector('label[for="max-tokens"]').textContent = getMessage('maxTokens');
    
    // 更新按钮文本
    document.getElementById('test-api').textContent = getMessage('testConnection');
    document.querySelector('button[type="submit"]').textContent = getMessage('saveConfig');
    
    // 更新数据管理部分
    document.querySelectorAll('h2')[1].textContent = getMessage('dataManagement');
    document.getElementById('export-config').textContent = getMessage('exportConfig');
    document.getElementById('import-config').textContent = getMessage('importConfig');
    
    // 更新提示词管理部分
    document.querySelectorAll('h2')[2].textContent = getMessage('promptManagement');
    document.querySelectorAll('h3')[0].textContent = getMessage('categoryManagement');
    document.getElementById('new-category').placeholder = getMessage('newCategory');
    document.getElementById('add-category').textContent = getMessage('addCategory');
    document.querySelectorAll('h3')[1].textContent = getMessage('promptTemplate');
    document.getElementById('add-prompt').textContent = getMessage('addPrompt');
}

// API 配置相关函数
document.addEventListener('DOMContentLoaded', function() {
    // 加载语言包
    loadLocales();
    
    // 加载已保存的语言设置
    loadLanguageSetting();
    
    // 加载已保存的配置
    loadConfig();
    
    // 绑定事件监听器
    document.getElementById('api-config-form').addEventListener('submit', saveConfig);
    document.getElementById('test-api').addEventListener('click', testApiConnection);
    document.getElementById('temperature').addEventListener('input', updateTemperatureValue);
    document.getElementById('add-category').addEventListener('click', addCategory);
    document.getElementById('add-prompt').addEventListener('click', showAddPromptModal);
    document.getElementById('export-config').addEventListener('click', exportConfig);
    document.getElementById('import-config').addEventListener('click', triggerImportConfig);
    document.getElementById('import-file').addEventListener('change', importConfig);
    document.getElementById('language').addEventListener('change', changeLanguage);
    
    // 加载分类和提示词
    loadCategories();
    loadPrompts();
});

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
    ], function(result) {
        if (result.apiUrl) document.getElementById('api-url').value = result.apiUrl;
        if (result.apiKey) document.getElementById('api-key').value = result.apiKey;
        if (result.model) document.getElementById('model').value = result.model;
        if (result.temperature) {
            document.getElementById('temperature').value = result.temperature;
            document.getElementById('temperature-value').textContent = result.temperature;
        }
        if (result.maxTokens) document.getElementById('max-tokens').value = result.maxTokens;
    });
}

// 保存配置
function saveConfig(event) {
    event.preventDefault();
    
    const config = {
        apiUrl: document.getElementById('api-url').value,
        apiKey: document.getElementById('api-key').value,
        model: document.getElementById('model').value,
        temperature: document.getElementById('temperature').value,
        maxTokens: document.getElementById('max-tokens').value
    };
    
    chrome.storage.sync.set(config, function() {
        alert(currentLanguage === 'zh-CN' ? '配置已保存！' : 'Configuration saved!');
    });
}

// 测试 API 连接
function testApiConnection() {
    const apiUrl = document.getElementById('api-url').value;
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model').value;
    
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
    
    // 发送测试消息到后台脚本
    chrome.runtime.sendMessage({
        type: 'CALL_AI_API',
        data: {
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
            showTestResult(currentLanguage === 'zh-CN' ? 'API 连接成功！' : 'API connection successful!', 'success');
        } else {
            showTestResult(`${currentLanguage === 'zh-CN' ? '测试失败：' : 'Test failed: '} ${response.error}`, 'error');
        }
    });
}

// 显示测试结果
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
                loadCategories();
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

// 分类管理相关函数
function loadCategories() {
    chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        renderCategories(categories);
        populateCategorySelector(categories);
    });
}

function renderCategories(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${category.name}</span>
            <div class="category-actions">
                <button class="edit-btn" data-index="${index}">${currentLanguage === 'zh-CN' ? '编辑' : 'Edit'}</button>
                <button class="delete-btn" data-index="${index}">${currentLanguage === 'zh-CN' ? '删除' : 'Delete'}</button>
            </div>
        `;
        categoryList.appendChild(li);
    });
    
    // 绑定编辑和删除事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            editCategory(index);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deleteCategory(index);
        });
    });
}

function populateCategorySelector(categories) {
    const selector = document.getElementById('category-selector');
    selector.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        selector.appendChild(option);
    });
}

function addCategory() {
    const categoryName = document.getElementById('new-category').value.trim();
    if (!categoryName) {
        alert(currentLanguage === 'zh-CN' ? '请输入分类名称' : 'Please enter category name');
        return;
    }
    
    chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        // 检查分类是否已存在
        if (categories.some(cat => cat.name === categoryName)) {
            alert(currentLanguage === 'zh-CN' ? '分类名称已存在' : 'Category name already exists');
            return;
        }
        
        categories.push({ id: Date.now(), name: categoryName });
        
        chrome.storage.sync.set({ categories: categories }, function() {
            document.getElementById('new-category').value = '';
            loadCategories();
        });
    });
}

function editCategory(index) {
    chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        const newName = prompt(currentLanguage === 'zh-CN' ? '请输入新的分类名称:' : 'Please enter new category name:', categories[index].name);
        
        if (newName && newName.trim()) {
            // 检查分类是否已存在
            if (categories.some((cat, i) => i !== parseInt(index) && cat.name === newName.trim())) {
                alert(currentLanguage === 'zh-CN' ? '分类名称已存在' : 'Category name already exists');
                return;
            }
            
            categories[index].name = newName.trim();
            chrome.storage.sync.set({ categories: categories }, function() {
                loadCategories();
            });
        }
    });
}

function deleteCategory(index) {
    if (!confirm(currentLanguage === 'zh-CN' ? '确定要删除这个分类吗？删除分类将同时删除该分类下的所有提示词模板。' : 'Are you sure you want to delete this category? Deleting the category will also delete all prompt templates under this category.')) return;
    
    chrome.storage.sync.get(['categories', 'prompts'], function(result) {
        const categories = result.categories || [];
        const categoryId = categories[index].id;
        
        // 删除分类
        categories.splice(index, 1);
        
        // 删除该分类下的所有提示词
        const prompts = (result.prompts || []).filter(prompt => prompt.categoryId !== categoryId);
        
        chrome.storage.sync.set({ 
            categories: categories,
            prompts: prompts
        }, function() {
            loadCategories();
            loadPrompts();
        });
    });
}

// 提示词管理相关函数
function loadPrompts() {
    chrome.storage.sync.get(['prompts'], function(result) {
        const prompts = result.prompts || [];
        renderPrompts(prompts);
    });
}

function renderPrompts(prompts) {
    const promptList = document.getElementById('prompt-list');
    promptList.innerHTML = '';
    
    // 获取分类信息用于显示
    chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat.name;
        });
        
        prompts.forEach((prompt, index) => {
            const categoryName = categoryMap[prompt.categoryId] || (currentLanguage === 'zh-CN' ? '未知分类' : 'Unknown Category');
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${prompt.title}</strong>
                    <div class="prompt-category">${currentLanguage === 'zh-CN' ? '分类:' : 'Category:'} ${categoryName}</div>
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
                    <label for="prompt-category">${currentLanguage === 'zh-CN' ? '分类:' : 'Category:'}</label>
                    <select id="prompt-category"></select>
                </div>
                <div class="form-group">
                    <label for="prompt-content">${currentLanguage === 'zh-CN' ? '内容:' : 'Content:'}</label>
                    <textarea id="prompt-content" placeholder="${currentLanguage === 'zh-CN' ? '提示词内容，可以使用 {content} 占位符表示网页内容' : 'Prompt content, you can use {content} placeholder to represent web content'}" rows="6"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button id="save-prompt" class="save-btn">${currentLanguage === 'zh-CN' ? '保存' : 'Save'}</button>
                <button id="cancel-prompt" class="cancel-btn">${currentLanguage === 'zh-CN' ? '取消' : 'Cancel'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 填充分类选择器
    chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        const selector = document.getElementById('prompt-category');
        selector.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selector.appendChild(option);
        });
    });
    
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
    const categoryId = document.getElementById('prompt-category').value;
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
            categoryId: parseInt(categoryId),
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
    chrome.storage.sync.get(['prompts', 'categories'], function(result) {
        const prompts = result.prompts || [];
        const categories = result.categories || [];
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
                        <label for="prompt-category">${currentLanguage === 'zh-CN' ? '分类:' : 'Category:'}</label>
                        <select id="prompt-category"></select>
                    </div>
                    <div class="form-group">
                        <label for="prompt-content">${currentLanguage === 'zh-CN' ? '内容:' : 'Content:'}</label>
                        <textarea id="prompt-content" placeholder="${currentLanguage === 'zh-CN' ? '提示词内容，可以使用 {content} 占位符表示网页内容' : 'Prompt content, you can use {content} placeholder to represent web content'}" rows="6">${prompt.content}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="save-prompt" class="save-btn">${currentLanguage === 'zh-CN' ? '保存' : 'Save'}</button>
                    <button id="cancel-prompt" class="cancel-btn">${currentLanguage === 'zh-CN' ? '取消' : 'Cancel'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 填充分类选择器并选中当前分类
        const selector = document.getElementById('prompt-category');
        selector.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            if (category.id === prompt.categoryId) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
        
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
    const categoryId = document.getElementById('prompt-category').value;
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
            categoryId: parseInt(categoryId),
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