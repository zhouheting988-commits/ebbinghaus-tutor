// scripts/extensions/third-party/EbbinghausTrainer/src/overlay.js
//
// 这个版本是“最后一切正常”的版本：
// - 顶部标题两行（艾宾浩斯词汇导师 / 第X天 · Round Y/3）
// - 右上角红色日期牌 + 白色✕按钮
// - 四个竖排tab按钮（掌握进度 / 词清单 / 复习计划 / 学习轮次）
// - 默认高亮【学习轮次】
// - 中间内容区域根据tab切换（调用 tabs/*.js）
// - 外层点黑幕可关闭
//
// 注意：依赖以下模块已经存在并可用：
//   ./data.js            -> getTodaySnapshot(), getRound()
//   ./tabs/vocabulary.js -> buildTabVocabularyHTML()
//   ./tabs/wordlists.js  -> buildTabWordListsHTML()
//   ./tabs/schedule.js   -> buildTabScheduleHTML()
//   ./tabs/studycontrol.js -> buildTabStudyControlHTML()
//
// 另外 index.js 会 import { showOverlay, hideOverlay } from './src/overlay.js'
// 并在 toolbar.js 里点学士帽时调用 showOverlay()。

import { getTodaySnapshot, getRound } from './data.js';
import { buildTabVocabularyHTML }   from './tabs/vocabulary.js';
import { buildTabWordListsHTML }    from './tabs/wordlists.js';
import { buildTabScheduleHTML }     from './tabs/schedule.js';
import { buildTabStudyControlHTML } from './tabs/studycontrol.js';

// 全局单例 DOM 引用
let overlayRootEl = null;
let overlayCardEl = null;

// 当前激活的 tab
// 按你当时截图，默认亮的是“学习轮次”
let activeTab = 'rounds';

// tab 列表定义
const TAB_DEFS = [
    { key: 'progress', label: '掌握进度', builder: buildTabVocabularyHTML },
    { key: 'words',    label: '词清单',   builder: buildTabWordListsHTML },
    { key: 'schedule', label: '复习计划', builder: buildTabScheduleHTML },
    { key: 'rounds',   label: '学习轮次', builder: buildTabStudyControlHTML },
];

// 工具：生成当前日期（右上角红牌）
function getDateParts() {
    const now = new Date();
    const m = now.getMonth() + 1; // 1~12
    const d = now.getDate();      // 1~31
    return {
        monthText: m + '月',
        dayText: d < 10 ? ('0' + d) : String(d),
    };
}

// 头部区域 HTML
function buildHeaderHTML() {
    const snap = getTodaySnapshot(); // { currentDay, ... }
    const round = getRound() || 1;   // Round 1/3 等
    const { monthText, dayText } = getDateParts();

    return `
        <div style="
            position:relative;
            padding-right:70px; /* 给右上角留空间放日期和关闭 */
            color:#fff;
        ">

            <!-- 标题 + 副标题 -->
            <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="
                    font-size:18px;
                    font-weight:600;
                    display:flex;
                    align-items:center;
                    gap:8px;
                    line-height:1.2;
                    color:#fff;
                    flex-wrap:nowrap;
                ">
                    <span style="font-size:20px;line-height:20px;">🎓</span>
                    <span>艾宾浩斯词汇导师</span>
                </div>

                <div style="
                    font-size:15px;
                    line-height:1.3;
                    color:#ddd;
                    font-weight:500;
                ">
                    第 ${snap.currentDay} 天 · Round ${round}/3
                </div>
            </div>

            <!-- 右上角红色日期牌 -->
            <div style="
                position:absolute;
                top:0;
                right:36px;
                background:#d32f2f;
                color:#fff;
                border-radius:6px;
                padding:6px 8px;
                min-width:48px;
                text-align:center;
                font-weight:600;
                line-height:1.2;
                box-shadow:0 4px 10px rgba(0,0,0,0.6);
                font-size:14px;
            ">
                <div>${monthText}</div>
                <div style="font-size:16px;">${dayText}</div>
            </div>

            <!-- 关闭按钮 -->
            <button id="ebb_close_btn" style="
                position:absolute;
                top:0;
                right:0;
                width:32px;
                height:32px;
                border-radius:999px;
                background:rgba(0,0,0,0.4);
                border:1px solid rgba(255,255,255,0.5);
                color:#fff;
                font-size:16px;
                font-weight:600;
                line-height:30px;
                text-align:center;
                cursor:pointer;
            ">✕</button>
        </div>
    `;
}

// 顶部四个竖排 tab 按钮
function buildTabsNavHTML() {
    // styling 公共部分
    const baseBtnStyle = `
        display:flex;
        align-items:center;
        justify-content:center;
        min-width:64px;
        min-height:110px;
        padding:12px 16px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,0.35);
        background:rgba(0,0,0,0.4);
        color:#fff;
        font-size:22px;
        font-weight:500;
        line-height:1.2;
        writing-mode:vertical-rl;
        text-orientation:upright;
        cursor:pointer;
        user-select:none;
    `;

    return `
        <div style="
            display:flex;
            flex-wrap:nowrap;
            gap:12px;
            margin-top:16px;
            margin-bottom:16px;
        ">
            ${TAB_DEFS.map(tab => {
                // 绿色高亮样式（activeTab）
                const isActive = (tab.key === activeTab);
                const extraStyle = isActive
                    ? `
                        background:rgba(0,128,0,0.6);
                        border:1px solid rgba(0,255,0,0.6);
                    `
                    : ``;

                return `
                <div
                    class="ebb-nav-btn"
                    data-tab="${tab.key}"
                    style="${baseBtnStyle} ${extraStyle}"
                >
                    ${tab.label}
                </div>`;
            }).join('')}
        </div>
    `;
}

// 中间内容区：根据 activeTab 取对应 builder
function buildActiveTabContentHTML() {
    const def = TAB_DEFS.find(t => t.key === activeTab);
    if (!def) {
        return `<div style="color:#fff;">(未知面板)</div>`;
    }
    // 每个 builder() 自己返回一段 <div> ... or table ... HTML
    const inner = def.builder();

    return `
        <div style="
            border:1px solid rgba(255,255,255,0.3);
            border-radius:8px;
            background:rgba(0,0,0,0.2);
            padding:16px;
            color:#fff;
            font-size:15px;
            line-height:1.5;
            max-height:60vh;
            overflow:hidden;
        ">

            ${inner}

        </div>
    `;
}

// 整个卡片内部 HTML
function buildOverlayInnerHTML() {
    return `
        ${buildHeaderHTML()}
        ${buildTabsNavHTML()}
        ${buildActiveTabContentHTML()}
    `;
}

// 把 overlayRootEl / overlayCardEl 建好（如果还没建）
function ensureOverlayDOM() {
    if (!overlayRootEl) {
        overlayRootEl = document.createElement('div');
        overlayRootEl.id = 'ebb_overlay_root';
        overlayRootEl.style.position = 'fixed';
        overlayRootEl.style.left = '0';
        overlayRootEl.style.top = '0';
        overlayRootEl.style.width = '100vw';
        overlayRootEl.style.height = '100vh';
        overlayRootEl.style.background = 'rgba(0,0,0,0.4)';
        overlayRootEl.style.zIndex = '9999';
        overlayRootEl.style.display = 'flex';
        overlayRootEl.style.alignItems = 'center';
        overlayRootEl.style.justifyContent = 'center';
        overlayRootEl.style.padding = '20px';
        overlayRootEl.style.boxSizing = 'border-box';

        // 点击黑幕空白区域关闭
        overlayRootEl.addEventListener('click', (ev) => {
            if (ev.target === overlayRootEl) {
                hideOverlay();
            }
        }, true);

        overlayCardEl = document.createElement('div');
        overlayCardEl.id = 'ebb_overlay_card';
        overlayCardEl.style.position = 'relative';
        overlayCardEl.style.background = 'rgba(20,20,20,0.95)';
        overlayCardEl.style.borderRadius = '12px';
        overlayCardEl.style.border = '1px solid rgba(255,255,255,0.2)';
        overlayCardEl.style.color = '#fff';
        overlayCardEl.style.width = '90%';
        overlayCardEl.style.maxWidth = '480px';
        overlayCardEl.style.maxHeight = '80vh';
        overlayCardEl.style.overflowY = 'auto';
        overlayCardEl.style.padding = '16px';
        overlayCardEl.style.boxShadow = '0 20px 60px rgba(0,0,0,0.8)';

        overlayRootEl.appendChild(overlayCardEl);
        document.body.appendChild(overlayRootEl);
    }
}

// 重新渲染（比如切 tab 后调用）
function rerenderOverlay() {
    if (!overlayCardEl) return;
    overlayCardEl.innerHTML = buildOverlayInnerHTML();

    // 重新给关闭按钮和tab按钮绑定事件
    bindOverlayInnerEvents();
}

// 给当前卡片内的元素（关闭按钮、tab按钮）绑事件
function bindOverlayInnerEvents() {
    // 关闭按钮
    const closeBtn = overlayCardEl.querySelector('#ebb_close_btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            hideOverlay();
        }, true);
    }

    // tab 切换按钮
    overlayCardEl.querySelectorAll('.ebb-nav-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const tabKey = btn.getAttribute('data-tab');
            if (tabKey && tabKey !== activeTab) {
                activeTab = tabKey;
                rerenderOverlay();
            }
        }, true);
    });
}

// 对外开放：显示面板
export function showOverlay() {
    // 确保 DOM 存在
    ensureOverlayDOM();

    // 每次打开，都以 “学习轮次” 作为初始高亮（= 你最后正常截图时的逻辑）
    activeTab = 'rounds';

    // 渲染内容
    rerenderOverlay();

    // 显示
    overlayRootEl.style.display = 'flex';
}

// 对外开放：隐藏面板
export function hideOverlay() {
    if (overlayRootEl) {
        overlayRootEl.style.display = 'none';
    }
}
