// 弹出窗口的交互逻辑

document.addEventListener('DOMContentLoaded', function() {
    // 绑定打开配置页面按钮事件
    document.getElementById('open-config').addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
    
    // 绑定使用帮助按钮事件
    document.getElementById('get-help').addEventListener('click', function() {
        // 显示帮助信息
        alert('使用说明：\n\n1. 点击页面右下角的绿色 AI 按钮打开对话窗口\n2. 在对话窗口中输入您的问题\n3. AI 将基于当前网页内容为您提供回答\n\n您可以在配置页面中设置 API Key 和自定义提示词模板。');
    });
    
    // 检查配置状态
    checkConfigStatus();
});

// 检查配置状态
function checkConfigStatus() {
    chrome.storage.sync.get(['apiKey'], function(result) {
        const statusElement = document.createElement('div');
        statusElement.className = 'config-status';
        
        if (result.apiKey) {
            statusElement.innerHTML = '<span class="status-indicator status-ok"></span> API 已配置';
            statusElement.style.color = '#4CAF50';
        } else {
            statusElement.innerHTML = '<span class="status-indicator status-missing"></span> 未配置 API';
            statusElement.style.color = '#F44336';
        }
        
        // 插入到标题下方
        const header = document.querySelector('.header');
        header.appendChild(statusElement);
    });
}