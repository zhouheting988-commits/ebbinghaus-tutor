// ===== MemorySheet · Entry Patch v2 =====
(function () {
  // —— 通用面板（占位） ——
  function openPanel() {
    let panel = document.getElementById('memsheet-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'memsheet-panel';
      Object.assign(panel.style, {
        position: 'fixed', right: '16px', bottom: '64px', zIndex: 2147483647,
        width: '320px', maxHeight: '60vh', overflow: 'auto',
        background: '#fff', border: '1px solid #ccc', borderRadius: '12px',
        boxShadow: '0 6px 18px rgba(0,0,0,.25)', padding: '12px'
      });
      panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong>Memory Sheet · 面板</strong>
          <button id="memsheet-close" style="border:0;background:#eee;padding:4px 8px;border-radius:8px;cursor:pointer;">关闭</button>
        </div>
        <div style="font-size:13px;color:#666;line-height:1.5;">
          入口就绪 ✅（说明扩展正在运行）<br/>
          现在的三个按钮是占位，用来验证事件钩子；确认可见后我们再挂真实逻辑。
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
          <button id="memsheet-start" style="padding:6px 10px;border-radius:8px;">开始学习（空）</button>
          <button id="memsheet-review" style="padding:6px 10px;border-radius:8px;">复习（空）</button>
          <button id="memsheet-end" style="padding:6px 10px;border-radius:8px;">结束今天（空）</button>
        </div>
      `;
      document.body.appendChild(panel);
      document.getElementById('memsheet-close').onclick = () => panel.remove();
      document.getElementById('memsheet-start').onclick = () => alert('StartStudy() 占位触发');
      document.getElementById('memsheet-review').onclick = () => alert('ReviewLists() 占位触发');
      document.getElementById('memsheet-end').onclick = () => alert('EndDay() 占位触发');
    }
  }

  // —— 入口#1：工具栏按钮（官方 API） ——
  function addToolbarBtn() {
    try {
      const ctx = window.SillyTavern?.getContext?.();
      const addBtn = ctx?.addToolbarButton || ctx?.ui?.addToolbarButton;
      const es = ctx?.eventSource, et = ctx?.event_types;
      if (es && et && typeof addBtn === 'function') {
        es.on(et.APP_READY, () => {
          addBtn('记忆表', openPanel);  // 顶部工具栏会出现“记忆表”文本按钮（在手机上可能在“···”里）
          console.log('[MemorySheet] toolbar button registered');
        });
        return true;
      }
    } catch (e) { console.warn(e); }
    return false;
  }

  // —— 入口#2：斜杠命令 /记忆表 ——
  function addSlash() {
    try {
      const ctx = window.SillyTavern?.getContext?.();
      const register = ctx?.registerSlashCommand || window.registerSlashCommand;
      if (typeof register === 'function') {
        register('记忆表', '打开 Memory Sheet 面板', openPanel);
        console.log('[MemorySheet] slash command registered');
        return true;
      }
    } catch (e) { console.warn(e); }
    return false;
  }

  // —— 入口#3：浮动按钮（高 Z-index；移动端可见） ——
  function addFloatingButton() {
    if (document.getElementById('memsheet-fab')) return;
    const btn = document.createElement('button');
    btn.id = 'memsheet-fab';
    btn.textContent = '记忆表';
    Object.assign(btn.style, {
      position: 'fixed',
      // 为避免被底部栏遮挡，默认放到左上角；你也可以改成右下角
      left: '16px', top: '16px',
      zIndex: 2147483647,
      padding: '10px 14px', borderRadius: '12px', border: '1px solid #999',
      background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,.2)', cursor: 'pointer'
    });
    btn.onclick = openPanel;
    document.body.appendChild(btn);
  }

  // —— 初始化顺序：先官方按钮/斜杠，再兜底浮动按钮 ——
  function init() {
    const ok1 = addToolbarBtn();
    const ok2 = addSlash();
    // 延迟一点点再挂浮动按钮，确保页面渲染完毕
    setTimeout(addFloatingButton, (ok1 || ok2) ? 1200 : 300);
    console.log('[MemorySheet] entry patch v2 initialized');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
