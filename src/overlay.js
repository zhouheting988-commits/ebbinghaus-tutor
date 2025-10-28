// scripts/extensions/third-party/EbbinghausTrainer/src/overlay.js

import { data, getTodaySnapshot, getRound } from './data.js';
import { buildTabVocabularyHTML }   from './tabs/vocabulary.js';
import { buildTabWordlistsHTML }    from './tabs/wordlists.js';
import { buildTabScheduleHTML }     from './tabs/schedule.js';
import { buildTabStudyControlHTML } from './tabs/studycontrol.js';

let overlayRoot   = null; // 半透明遮罩
let overlayCard   = null; // 黑色主卡片
let activeTabKey  = 'vocabulary'; // 默认高亮“掌握进度”
let initialized   = false;

// tab 配置：顺序 = 你界面上那四个按钮的顺序
const TAB_DEFS = [
  { key: 'vocabulary',   label: '掌握进度',   builder: buildTabVocabularyHTML   },
  { key: 'wordlists',    label: '单词清单',   builder: buildTabWordlistsHTML    },
  { key: 'schedule',     label: '复习计划',   builder: buildTabScheduleHTML     },
  { key: 'studycontrol', label: '学习轮次',   builder: buildTabStudyControlHTML },
];

// -------------- 工具：生成头部(标题+日期+Round信息) ----------------
function buildHeaderBlock() {
  const snap = getTodaySnapshot(); // 从 data.js 拿今天 Day 等
  const currentDay  = snap.currentDay || data().Study_Control.Current_Day || 1;
  const currentRound = getRound() || 1;

  // 日期牌
  const now = new Date();
  const mm  = now.getMonth() + 1;
  const dd  = now.getDate();

  // 标题+副标题
  // 第一行: 🎓 + 艾宾浩斯词汇导师   （图标和文字同一行）
  // 第二行: 第 X 天 ・ Round Y / 3
  // 右上角: 日期红牌 + 关闭按钮
  return `
    <div style="
      position:relative;
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      flex-wrap:nowrap;
      gap:12px;
    ">

      <!-- 左侧 标题块 -->
      <div style="color:#fff; font-weight:600; line-height:1.4;">
        <div style="display:flex; align-items:center; gap:8px; font-size:20px; font-weight:600; color:#fff;">
          <span style="font-size:20px; line-height:1;">🎓</span>
          <span>艾宾浩斯词汇导师</span>
        </div>
        <div style="font-size:16px; font-weight:500; color:#dcdcdc; line-height:1.4; margin-top:4px;">
          第 ${currentDay} 天 ・ Round ${currentRound}/3
        </div>
      </div>

      <!-- 右侧 日期牌 + 关闭按钮 -->
      <div style="position:relative; display:flex; flex-shrink:0;">
        <div style="
          background:#c62828;
          color:#fff;
          border-radius:8px;
          padding:6px 10px;
          line-height:1.2;
          font-weight:600;
          text-align:center;
          min-width:52px;
        ">
          <div style="font-size:14px;">${mm}月</div>
          <div style="font-size:18px;font-weight:700;">${dd}</div>
        </div>

        <button id="ebb_close_btn" style="
          position:absolute;
          top:-8px;
          right:-8px;
          width:32px;
          height:32px;
          border-radius:50%;
          border:1px solid rgba(255,255,255,0.5);
          background:rgba(0,0,0,0.5);
          color:#fff;
          font-size:16px;
          font-weight:500;
          line-height:30px;
          text-align:center;
          cursor:pointer;
        ">✕</button>
      </div>
    </div>
  `;
}

// -------------- 工具：四个tab按钮区域 ----------------
function buildTabButtonsBlock() {
  // 给按钮一些下边距，把整块往下推，避免“太贴顶”
  const btnsHTML = TAB_DEFS.map(tab => {
    const isActive = (tab.key === activeTabKey);

    const bgColor   = isActive ? '#1c7d2f' : 'rgba(0,0,0,0.4)';
    const borderCol = isActive ? '#1c7d2f' : 'rgba(255,255,255,0.3)';
    const fontColor = '#fff';

    return `
      <button class="ebb_tab_btn"
        data-tab="${tab.key}"
        style="
          background:${bgColor};
          color:${fontColor};
          border:1px solid ${borderCol};
          border-radius:10px;
          padding:10px 14px;
          min-width:72px;
          font-size:20px;
          line-height:1.4;
          font-weight:500;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          cursor:pointer;
        ">
        ${tab.label.replace(/(.)/g, '$1<br/>')}
      </button>
    `;
  }).join('');

  return `
    <div style="
      margin-top:16px;
      margin-bottom:16px;
      display:flex;
      flex-wrap:nowrap;
      gap:12px;
      justify-content:flex-start;
    ">
      ${btnsHTML}
    </div>
  `;
}

// -------------- 工具：当前 tab 的内容 ----------------
function buildActiveTabContent() {
  const def = TAB_DEFS.find(t => t.key === activeTabKey);
  if (!def) return `<div style="color:#fff;">(未找到此页面)</div>`;

  // 各 tab 的 builder() 自己会返回完整的内部块（含滚动等）
  // 我们再给一层 container 让它和整体边框统一
  const innerHTML = def.builder();

  return `
    <div style="
      border:1px solid rgba(255,255,255,0.25);
      border-radius:10px;
      background:rgba(0,0,0,0.25);
      color:#fff;
      font-size:16px;
      line-height:1.5;
      padding:16px;
      max-height:60vh;
      overflow-y:auto;
      -webkit-overflow-scrolling:touch;
    ">
      ${innerHTML}
    </div>
  `;
}

// -------------- 主卡片整体 HTML ----------------
function renderCardHTML() {
  return `
    <div style="
      display:flex;
      flex-direction:column;
      gap:8px;
    ">
      ${buildHeaderBlock()}
      ${buildTabButtonsBlock()}
      ${buildActiveTabContent()}
    </div>
  `;
}

// -------------- 绑定交互（关闭、点tab切换） ----------------
function bindOverlayEvents() {
  // 关闭按钮
  const closeBtn = overlayCard.querySelector('#ebb_close_btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      hideOverlay();
    }, { once: true });
  }

  // 切换 tab
  const tabBtns = overlayCard.querySelectorAll('.ebb_tab_btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const newKey = btn.getAttribute('data-tab');
      if (newKey && newKey !== activeTabKey) {
        activeTabKey = newKey;
        refreshOverlay(); // 重新渲染卡片
      }
    });
  });

  // 点击遮罩空白处关闭
  overlayRoot.addEventListener('click', onOverlayRootClick, { once: true });
}
function onOverlayRootClick(e) {
  if (e.target === overlayRoot) {
    hideOverlay();
  }
}

// -------------- 刷新卡片（切tab时 / 打开时） ----------------
function refreshOverlay() {
  if (!overlayCard) return;
  overlayCard.innerHTML = renderCardHTML();
  bindOverlayEvents();
}

// -------------- 创建DOM（只在第一次 showOverlay 时做） ----------------
function ensureOverlayDOM() {
  if (initialized && overlayRoot && overlayCard && document.body.contains(overlayRoot)) {
    return;
  }

  // 半透明背景
  overlayRoot = document.createElement('div');
  overlayRoot.id = 'ebb_overlay_root';
  overlayRoot.style.position = 'fixed';
  overlayRoot.style.left = '0';
  overlayRoot.style.top = '0';
  overlayRoot.style.width = '100vw';
  overlayRoot.style.height = '100vh';
  overlayRoot.style.background = 'rgba(0,0,0,0.4)';
  overlayRoot.style.zIndex = '9999';
  overlayRoot.style.display = 'flex';
  overlayRoot.style.alignItems = 'center';
  overlayRoot.style.justifyContent = 'center';
  overlayRoot.style.padding = '20px';
  overlayRoot.style.boxSizing = 'border-box';

  // 主黑卡片
  overlayCard = document.createElement('div');
  overlayCard.id = 'ebb_overlay_card';
  overlayCard.style.background = 'rgba(20,20,20,0.95)';
  overlayCard.style.borderRadius = '16px';
  overlayCard.style.border = '1px solid rgba(255,255,255,0.25)';
  overlayCard.style.color = '#fff';
  overlayCard.style.width = '90%';
  overlayCard.style.maxWidth = '480px';
  overlayCard.style.maxHeight = '80vh';
  overlayCard.style.overflow = 'hidden';
  overlayCard.style.padding = '20px 20px 24px 20px'; // 往下挪，避免贴顶
  overlayCard.style.boxShadow = '0 20px 60px rgba(0,0,0,0.8)';
  overlayCard.style.display = 'flex';
  overlayCard.style.flexDirection = 'column';

  overlayRoot.appendChild(overlayCard);
  document.body.appendChild(overlayRoot);

  initialized = true;
}

// -------------- 对外暴露：显示 / 隐藏 ----------------
export function showOverlay() {
  ensureOverlayDOM();

  // 每次打开时，默认回到“掌握进度”并重新算今天/round
  activeTabKey = 'vocabulary';

  refreshOverlay();

  overlayRoot.style.display = 'flex';
}

export function hideOverlay() {
  if (overlayRoot) {
    overlayRoot.style.display = 'none';
  }
}
