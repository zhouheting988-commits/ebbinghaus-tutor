// scripts/extensions/third-party/EbbinghausTrainer/index.js

import { initData } from './src/data.js';
import { insertTopButton } from './src/toolbar.js';
import { showOverlay, hideOverlay } from './src/overlay.js';

(function () {
  let uiReady = false;

  // 把“当前学习状态”自动塞到发给 AI 的消息前面
  function hookSendBox() {
  try {
    const ta = document.querySelector('#send_textarea');
    if (!ta) {
      console.warn('[EbbinghausTrainer] 没找到输入框(#send_textarea)，跳过自动注入学习状态');
      return;
    }

    ta.addEventListener('keydown', (e) => {
      // Shift+Enter 只是换行，不当作“发送”
      if (e.key !== 'Enter' || e.shiftKey) return;

      // 1. 读取当前即将发送的原始内容
      let userRaw = ta.value.trim();

      // 2. 口令检测：如果你在这条消息里说了“结束学习”
      //    这里的匹配你可以自己定义，比如 '结束学习' 或 '/finish' 等
      const isFinishCmd =
        userRaw.includes('结束学习') ||
        userRaw.startsWith('/finish');

      if (isFinishCmd) {
        try {
          if (
            window.EbbinghausDataAPI &&
            typeof window.EbbinghausDataAPI.finalizeTodayAndAdvance === 'function'
          ) {
            // ✅ 推进到下一天、把今天成果打包成 ListN
            window.EbbinghausDataAPI.finalizeTodayAndAdvance();
          }
        } catch (advErr) {
          console.warn('[EbbinghausTrainer] finalizeTodayAndAdvance() 执行出错:', advErr);
        }
      }

      // 3. 无论是不是 finish，我们都重新生成“学习状态”
      //    因为如果刚才 finish 了，现在 Day 已经 +1 了
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

      // 4. 把状态塞到发给 AI 的文本最前面（如果还没塞过）
      if (statusText && !ta.value.includes('[学习状态]')) {
        ta.value = statusText + '\n\n' + ta.value;
      }

      // 不要 preventDefault，SillyTavern 之后会正常把 ta.value 发出去
      // ta.value 此时已经是：
      // [学习状态]
      // ...
      // 结束学习
      // （或你的平常内容）
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
