// scripts/extensions/third-party/EbbinghausTrainer/index.js
import { initData } from './src/data.js';
import { insertTopButton } from './src/toolbar.js';
import { showOverlay, hideOverlay } from './src/overlay.js';

(function () {
  let uiReady = false;

  function init() {
    if (uiReady) return; uiReady = true;

    initData(); // 读取/初始化本地数据
    // 按钮：与 5.0 一致（不动你喜欢的位置和图标）
    insertTopButton(() => showOverlay());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // 可给控制台调试
  window.EbbinghausUI = { showOverlay, hideOverlay };
})();
