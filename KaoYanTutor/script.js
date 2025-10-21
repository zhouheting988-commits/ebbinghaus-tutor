// 这是插件的前端部分，运行在你的浏览器里
// 它负责在界面上显示一个小窗口，展示学习进度

// 等待页面完全加载完毕
$(document).ready(function () {
    const FOLDER_NAME = 'KaoYanTutor'; // 必须和你的插件文件夹名一致

    // 创建插件的HTML界面元素
    const tutorPanel = `
        <div id="kaoyan-tutor-panel" class="kaoyan-tutor-container">
            <h4>考研词汇导师</h4>
            <p>当前学习日: <span id="ky-current-day">加载中...</span></p>
            <button id="ky-refresh-btn" class="menu_button">刷新状态</button>
        </div>
    `;

    // 将我们创建的界面元素添加到SillyTavern的右侧边栏
    $("#extensions_settings").append(tutorPanel);

    // 定义一个函数，用来从后端获取最新的学习状态并更新到界面上
    async function updateDisplay() {
        try {
            // fetchAPI是SillyTavern提供的一个函数，用来和后端(index.js)通信
            const response = await fetch(`/api/extensions/${FOLDER_NAME}/call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getStudyState', params: {} }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            // 更新界面上的天数显示
            $('#ky-current-day').text(data.currentDay);
        } catch (error) {
            console.error('[KaoYanTutor] Error fetching study state:', error);
            $('#ky-current-day').text('获取失败');
        }
    }

    // 给刷新按钮添加点击事件
    $('#ky-refresh-btn').on('click', function () {
        $('#ky-current-day').text('刷新中...');
        updateDisplay();
    });

    // 页面加载后，立即执行一次，获取初始状态
    updateDisplay();
});
