// scripts/extensions/third-party/EbbinghausTrainer/index.js

import { initData } from './src/data.js';
import { insertTopButton } from './src/toolbar.js';
import { showOverlay, hideOverlay } from './src/overlay.js';

(function () {
  let uiReady = false;

  // 这个时间戳用来防止你长按回车多次触发“结束学习”
  let lastFinalizeTs = 0;

  // 把“当前学习状态”自动塞到发给 AI 的消息前面
  function hookSendBox() {
    try {
      // SillyTavern 默认输入框一般是这个 id
      const ta = document.querySelector('#send_textarea');
      if (!ta) {
        console.warn('[EbbinghausTrainer] 没找到输入框(#send_textarea)，跳过自动注入学习状态');
        return;
      }

      ta.addEventListener('keydown', (e) => {
        // Shift+Enter 是换行，不算发送
        if (e.key !== 'Enter' || e.shiftKey) return;

        // 1. 读取你准备发出去的原始文本
        let userRaw = ta.value.trim();

        // 2. 判断是不是“结束学习”口令
        //    你可以自己决定以后要不要加更多触发词
        const isFinishCmd =
          userRaw.includes('结束学习') ||
          userRaw.startsWith('/finish');

        // 3. 如果是“结束学习”，那就推进一天（防止多次触发用时间戳限制）
        if (isFinishCmd) {
          const now = Date.now();
          if (now - lastFinalizeTs > 300) {
            lastFinalizeTs = now;
            try {
              if (
                window.EbbinghausDataAPI &&
                typeof window.EbbinghausDataAPI.finalizeTodayAndAdvance === 'function'
              ) {
                // ✅ 推进到下一天，把今天成果打包成 ListN
                window.EbbinghausDataAPI.finalizeTodayAndAdvance();
              }
            } catch (advErr) {
              console.warn('[EbbinghausTrainer] finalizeTodayAndAdvance() 执行出错:', advErr);
            }
          }
        }

        // 4. 重新生成“学习状态”文本
        //    （注意：如果刚才触发了结束学习，这里拿到的就是【下一天】的状态了）
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

        // 5. 如果这是“结束学习”，给 AI 一句班主任指令：
        //    “请总结今天并安排明天的热身任务”
        if (isFinishCmd && statusText) {
          statusText += '\n\n[指令] 今天学习已结束，请总结本日训练表现，指出薄弱点，并为明天的学习列出热身任务。';
        }

        // 6. 把状态塞到消息最前面（如果还没塞过）
        if (statusText && !ta.value.includes('[学习状态]')) {
          ta.value = statusText + '\n\n' + ta.value;
        }

        // 不阻止默认行为：
        // SillyTavern 仍然会把 ta.value 发送给 AI
        // 只是 ta.value 现在已经是：
        //
        // [学习状态]
        // - 今天是第 N 天
        // - 当前学习阶段：……
        // - 今日主背清单：……
        // - 今日复习清单：……
        // [指令] ...（仅在结束学习时才会加）
        //
        // 你的原始输入内容...
      }, true);
    } catch (err) {
      console.warn('[EbbinghausTrainer] hookSendBox 整体出错，但主UI继续可用:', err);
    }
  }

  function init() {
    if (uiReady) return;
    uiReady = true;

    // 1. 初始化/恢复所有本地学习数据（这一步会把 window.EbbinghausDataAPI 挂到全局）
    initData();

    // 2. 插学士帽入口（按钮+回调，点了就弹你的面板）
    insertTopButton(() => showOverlay());

    // 3. 绑定聊天框逻辑：自动加学习状态、自动日终结算
    hookSendBox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // 方便控制台手动调 overlay()
  window.EbbinghausUI = { showOverlay, hideOverlay };
})();
