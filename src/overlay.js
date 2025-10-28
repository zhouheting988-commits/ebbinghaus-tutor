// scripts/extensions/third-party/EbbinghausTrainer/src/overlay.js
//
// 稳定版：无额外位移/默认高亮“复习计划”版本
//
// 依赖：
//   data.js                -> data()
//   tabs/vocabulary.js     -> buildTabVocabularyHTML()
//   tabs/wordlists.js      -> buildTabWordListsHTML()
//   tabs/schedule.js       -> buildTabScheduleHTML()
//   tabs/studycontrol.js   -> buildTabStudyControlHTML()

import { data } from './data.js';
import { buildTabVocabularyHTML } from './tabs/vocabulary.js';
import { buildTabWordListsHTML } from './tabs/wordlists.js';
import { buildTabScheduleHTML } from './tabs/schedule.js';
import { buildTabStudyControlHTML } from './tabs/studycontrol.js';

let overlayRootEl = null;   // 半透明遮罩
let overlayCardEl = null;   // 黑色面板
let currentTab = 'schedule'; // 默认打开哪一页（当时是“复习计划”高亮成绿色）

// ============ 小工具 ============

// 日期徽章里要显示的 "10月 / 28" 这种
function buildDateBadgeHTML() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    return `
    <div style="
        background:#c62828;
        color:#fff;
        border-radius:8px;
        padding:6px 8px;
        font-size:14px;
        line-height:1.2;
        text-align:center;
        min-width:48px;
        font-weight:600;
    ">
        <div style="font-size:14px;line-height:1.2;">${m}月</div>
        <div style="font-size:18px;line-height:1.2;">${d}</div>
    </div>`;
}

// 头部（标题 + 天数+轮次 + 日期 + 关闭按钮）
function buildHeaderHTML() {
    const eb = data();
    const dayNum   = eb?.Study_Control?.Current_Day    ?? 1;
    const roundNum = eb?.Study_Control?.Current_Round ?? 1;

    return `
    <div style="
        display:flex;
        flex-direction:row;
        justify-content:space-between;
        align-items:flex-start;
        gap:10px;
        color:#fff;
        margin-bottom:12px;
    ">
        <!-- 左侧：学士帽 + 标题 + 行2(第X天 · Round Y/3) -->
        <div style="display:flex;flex-direction:column;flex-grow:1;min-width:0;">
            <div style="
                display:flex;
                flex-direction:row;
                align-items:flex-start;
                gap:8px;
                font-size:18px;
                line-height:1.3;
                font-weight:600;
                color:#fff;
                flex-wrap:wrap;
            ">
                <span style="font-size:18px;line-height:1.2;">🎓</span>
                <span style="white-space:nowrap;">艾宾浩斯词汇导师</span>
            </div>
            <div style="
                margin-top:4px;
                font-size:14px;
                line-height:1.4;
                color:#ccc;
                font-weight:500;
            ">
                第 ${dayNum} 天 · Round ${roundNum}/3
            </div>
        </div>

        <!-- 右侧：日期徽章 + 关闭按钮 -->
        <div style="
            display:flex;
            flex-direction:column;
            align-items:flex-end;
            gap:6px;
        ">
            ${buildDateBadgeHTML()}
            <button id="ebb_close_btn" style="
                background:rgba(255,255,255,0.08);
                border:1px solid rgba(255,255,255,0.4);
                color:#fff;
                border-radius:999px;
                width:32px;
                height:32px;
                line-height:30px;
                font-size:16px;
                font-weight:500;
                text-align:center;
                cursor:pointer;
            ">✕</button>
        </div>
    </div>
    `;
}

// 竖排按钮（掌握进度 / 词清单 / 复习计划 / 学习轮次）。
// isActive=true时用绿色背景
function buildTabButtonHTML(id, labelLines, isActive) {
    // labelLines 是 ['掌','握','进','度'] 这样的数组
    const textHTML = labelLines.join('<br/>');
    const bgColor  = isActive ? 'rgba(27,94,32,1)' : 'rgba(255,255,255,0.05)';
    const borderC  = isActive ? 'rgba(27,94,32,1)' : 'rgba(255,255,255,0.3)';
    return `
    <div id="${id}" style="
        background:${bgColor};
        border:1px solid ${borderC};
        border-radius:8px;
        padding:10px 16px;
        min-width:72px;
        text-align:center;
        color:#fff;
        font-size:20px;
        font-weight:500;
        line-height:1.4;
        cursor:pointer;
        user-select:none;
    ">
        <span style="display:block;">${textHTML}</span>
    </div>`;
}

// 上面四个竖排按钮的整排
function buildTabButtonsRowHTML() {
    return `
    <div style="
        display:flex;
        flex-direction:row;
        flex-wrap:nowrap;
        justify-content:flex-start;
        align-items:flex-start;
        gap:12px;
        margin-bottom:16px;
    ">
        ${buildTabButtonHTML(
            'ebb_tab_vocab',
            ['掌','握','进','度'],
            currentTab === 'vocab'
        )}
        ${buildTabButtonHTML(
            'ebb_tab_wordlists',
            ['单','词','清','单'],
            currentTab === 'wordlists'
        )}
        ${buildTabButtonHTML(
            'ebb_tab_schedule',
            ['复','习','计','划'],
            currentTab === 'schedule'
        )}
        ${buildTabButtonHTML(
            'ebb_tab_studyctrl',
            ['学','习','轮','次'],
            currentTab === 'studyctrl'
        )}
    </div>`;
}

// 根据 currentTab 拼装内容区域
function buildActiveTabContentHTML() {
    let innerHTML = '';
    if (currentTab === 'vocab') {
        innerHTML = buildTabVocabularyHTML();
    } else if (currentTab === 'wordlists') {
        innerHTML = buildTabWordListsHTML();
    } else if (currentTab === 'schedule') {
        innerHTML = buildTabScheduleHTML();
    } else if (currentTab === 'studyctrl') {
        innerHTML = buildTabStudyControlHTML();
    } else {
        innerHTML = `<div style="color:#fff;">(无内容)</div>`;
    }

    // 我们给内容区域加一个浅浅的外框，保持之前的观感
    return `
    <div style="
        color:#fff;
        font-size:14px;
        line-height:1.5;
    ">
        ${innerHTML}
    </div>`;
}

// 整个卡片（header + row buttons + tab content）
function buildOverlayInnerHTML() {
    return `
    ${buildHeaderHTML()}
    ${buildTabButtonsRowHTML()}
    ${buildActiveTabContentHTML()}
    `;
}

// ============ DOM控制 ============

// 创建遮罩+卡片 DOM（只做一次）
function ensureOverlayDOM() {
    if (overlayRootEl && overlayCardEl && document.body.contains(overlayRootEl)) {
        return;
    }

    // 遮罩
    overlayRootEl = document.createElement('div');
    overlayRootEl.id = 'ebb_overlay_root';
    overlayRootEl.style.position = 'fixed';
    overlayRootEl.style.left = '0';
    overlayRootEl.style.top = '0';
    overlayRootEl.style.width = '100vw';
    overlayRootEl.style.height = '100vh';
    overlayRootEl.style.background = 'rgba(0,0,0,0.5)';
    overlayRootEl.style.display = 'flex';
    overlayRootEl.style.alignItems = 'center';
    overlayRootEl.style.justifyContent = 'center';
    overlayRootEl.style.padding = '20px';
    overlayRootEl.style.boxSizing = 'border-box';
    overlayRootEl.style.zIndex = '9999';

    overlayRootEl.addEventListener('click', (e) => {
        // 点击遮罩空白处关闭
        if (e.target === overlayRootEl) {
            hideOverlay();
        }
    }, true);

    // 卡片
    overlayCardEl = document.createElement('div');
    overlayCardEl.id = 'ebb_overlay_card';
    overlayCardEl.style.background = 'rgba(20,20,20,0.95)';
    overlayCardEl.style.borderRadius = '12px';
    overlayCardEl.style.border = '1px solid rgba(255,255,255,0.2)';
    overlayCardEl.style.color = '#fff';
    overlayCardEl.style.width = '90%';
    overlayCardEl.style.maxWidth = '480px';
    overlayCardEl.style.maxHeight = '80vh';
    overlayCardEl.style.overflowY = 'auto';
    overlayCardEl.style.padding = '16px';
    overlayCardEl.style.boxSizing = 'border-box';
    overlayCardEl.style.boxShadow = '0 20px 60px rgba(0,0,0,0.8)';

    overlayRootEl.appendChild(overlayCardEl);
    document.body.appendChild(overlayRootEl);
}

// 刷新卡片里的HTML，并绑定事件（tab切换 / 关闭）
function renderOverlayCard() {
    if (!overlayCardEl) return;
    overlayCardEl.innerHTML = buildOverlayInnerHTML();

    // 绑定关闭
    const closeBtn = overlayCardEl.querySelector('#ebb_close_btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            hideOverlay();
        }, true);
    }

    // 绑定 tab 切换
    const tabVocabBtn = overlayCardEl.querySelector('#ebb_tab_vocab');
    const tabWordBtn  = overlayCardEl.querySelector('#ebb_tab_wordlists');
    const tabSchBtn   = overlayCardEl.querySelector('#ebb_tab_schedule');
    const tabStuBtn   = overlayCardEl.querySelector('#ebb_tab_studyctrl');

    if (tabVocabBtn) {
        tabVocabBtn.addEventListener('click', (ev) => {
            ev.preventDefault(); ev.stopPropagation();
            currentTab = 'vocab';
            renderOverlayCard();
        }, true);
    }
    if (tabWordBtn) {
        tabWordBtn.addEventListener('click', (ev) => {
            ev.preventDefault(); ev.stopPropagation();
            currentTab = 'wordlists';
            renderOverlayCard();
        }, true);
    }
    if (tabSchBtn) {
        tabSchBtn.addEventListener('click', (ev) => {
            ev.preventDefault(); ev.stopPropagation();
            currentTab = 'schedule';
            renderOverlayCard();
        }, true);
    }
    if (tabStuBtn) {
        tabStuBtn.addEventListener('click', (ev) => {
            ev.preventDefault(); ev.stopPropagation();
            currentTab = 'studyctrl';
            renderOverlayCard();
        }, true);
    }
}

// ============ 对外暴露的API ============

export function showOverlay() {
    currentTab = 'schedule'; // 打开后默认回到“复习计划”页（保持之前的行为）
    ensureOverlayDOM();
    renderOverlayCard();
    if (overlayRootEl) {
        overlayRootEl.style.display = 'flex';
    }
}

export function hideOverlay() {
    if (overlayRootEl) {
        overlayRootEl.style.display = 'none';
    }
}
