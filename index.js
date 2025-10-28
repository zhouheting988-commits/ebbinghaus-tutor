// scripts/extensions/third-party/EbbinghausTrainer/index.js

import {
  initData,
  buildLLMStatusString,
} from './src/data.js';

import { insertTopButton } from './src/toolbar.js';
import { showOverlay, hideOverlay } from './src/overlay.js';

(function () {
  let uiReady = false;

  // 给 SillyTavern 的输入框加监听：自动把学习状态塞到要发送的消息前面
  function hookSendBox() {
    // 如果你的主题里输入框 id 改了，这里要跟着改
    const ta = document.querySelector('#send_textarea');
    if (!ta) {
      console.warn('[EbbinghausTrainer] 未找到发送输入框 (#send_textarea)，暂时无法自动注入学习状态。');
      return;
    }

    ta.addEventListener('keydown', (e) => {
      // Shift+Enter 是换行，不是发送
      if (e.key !== 'Enter' || e.shiftKey) return;

      // 每次准备发消息时，我们先拿当前学习状态
      const statusText = buildLLMStatusString();

      // 如果本条消息里还没有状态块，就自动加上
      if (!ta.value.includes('[学习状态]')) {
        ta.value = statusText + '\n\n' + ta.value;
      }
      // 不阻止默认发送流程，SillyTavern 继续会把 ta.value 发给AI
    }, true);
  }

  function init() {
    if (uiReady) return;
    uiReady = true;

    // 1. 恢复/初始化学习数据
    initData();

    // 2. 插上学士帽入口
    insertTopButton(() => showOverlay());

    // 3. 尝试开启“自动喂状态给AI”
    try {
      hookSendBox();
    } catch (err) {
      console.warn('[EbbinghausTrainer] hookSendBox 出错，但主UI继续可用:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // 方便手动在控制台调
  window.EbbinghausUI = { showOverlay, hideOverlay };
})();
