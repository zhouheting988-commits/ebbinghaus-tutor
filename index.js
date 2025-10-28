// scripts/extensions/third-party/EbbinghausTrainer/index.js

import { initData } from './src/data.js';
import { insertTopButton } from './src/toolbar.js';
import { showOverlay, hideOverlay } from './src/overlay.js';

(function () {
  let uiReady = false;

  // 把“当前学习状态”自动塞到发给 AI 的消息前面
  function hookSendBox() {
    try {
      // SillyTavern 默认输入框一般是这个 id，如果你主题自定义过，记得换
      const ta = document.querySelector('#send_textarea');
      if (!ta) {
        console.warn('[EbbinghausTrainer] 没找到输入框(#send_textarea)，跳过自动注入学习状态');
        return;
      }

      ta.addEventListener('keydown', (e) => {
        // Shift+Enter 是换行，不是发送
        if (e.key !== 'Enter' || e.shiftKey) return;

        // 我们从全局拿状态串，而不是 import 直接拿
        // 因为 initData() 里我们会挂 window.EbbinghausDataAPI
        let statusText = '';
        try {
          if (
            window.EbbinghausDataAPI &&
            typeof window.EbbinghausDataAPI.buildLLMStatusString === 'function'
          ) {
            statusText = window.EbbinghausDataAPI.buildLLMStatusString();
          }
        } catch (errInner) {
          console.warn('[EbbinghausTrainer] buildLLMStatusString 执行报错:', errInner);
        }

        // 如果这条消息里还没有状态块，再注入，避免重复塞
        if (statusText && !ta.value.includes('[学习状态]')) {
          ta.value = statusText + '\n\n' + ta.value;
        }

        // 不阻止默认行为，SillyTavern 后面会照常把 ta.value 发出去
      }, true);
    } catch (err) {
      console.warn('[EbbinghausTrainer] hookSendBox 整体出错，但主UI继续可用:', err);
    }
  }

  function init() {
    if (uiReady) return;
    uiReady = true;

    // 1. 初始化/恢复所有本地学习数据（会顺便把 window.EbbinghausDataAPI 挂上）
    initData();

    // 2. 先插学士帽入口（按钮+回调）
    insertTopButton(() => showOverlay());

    // 3. 再去绑定聊天框注入逻辑。出了问题就只是注入失效，学士帽不受影响
    hookSendBox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // 方便你在控制台手动调试 overlay
  window.EbbinghausUI = { showOverlay, hideOverlay };
})();
