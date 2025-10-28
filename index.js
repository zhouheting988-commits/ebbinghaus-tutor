// scripts/extensions/third-party/EbbinghausTrainer/index.js

import {
  initData,
  buildLLMStatusString,
} from './src/data.js';

import { insertTopButton } from './src/toolbar.js';
import { showOverlay, hideOverlay } from './src/overlay.js';

(function () {
  let uiReady = false;

  // 监听聊天输入框，把学习状态自动塞进要发给AI的消息里
  function hookSendBox() {
    // SillyTavern 默认输入框是这个 id；如果你自己主题改过，可以把选择器改成实际的那个 textarea
    const ta = document.querySelector('#send_textarea');
    if (!ta) {
      console.warn('[EbbinghausTrainer] 未找到发送输入框 (#send_textarea)，无法注入学习状态。');
      return;
    }

    // 我们监听 keydown，因为 SillyTavern 也是在 keydown Enter 时触发发送
    ta.addEventListener('keydown', (e) => {
      // Shift+Enter 是换行，不是发送，不处理
      if (e.key !== 'Enter' || e.shiftKey) return;

      // 每次发送前，生成一段当前学习状态文本
      const statusText = buildLLMStatusString();

      // 如果这条消息已经有状态块了，就不要重复加
      if (!ta.value.includes('[学习状态]')) {
        // 把状态放在最上面，然后两个空行，再接着用户写的内容
        ta.value = statusText + '\n\n' + ta.value;
      }

      // 不阻止默认行为，SillyTavern 后面会照常把 ta.value 发送给AI
      // 我们只是提前把 ta.value 改成“状态+原内容”
    }, true);
  }

  function init() {
    if (uiReady) return;
    uiReady = true;

    // 1. 载入/初始化本地学习数据、轮次、计划表等
    initData();

    // 2. 在工具栏插入学士帽按钮。点击会弹出我们的面板
    insertTopButton(() => showOverlay());

    // 3. 把学习状态自动同步给AI
    hookSendBox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // 控制台调试入口
  window.EbbinghausUI = { showOverlay, hideOverlay };
})();
