// scripts/extensions/third-party/EbbinghausTrainer/src/overlay.js

import { getTodaySnapshot, getRound } from './data.js';
import { buildTabScheduleHTML } from './tabs/schedule.js';
import { buildTabRoundHTML, bindRoundTabEvents } from './tabs/round.js';
// 如果你还有另外两个页，比如掌握进度/单词清单：保持原来的 import
// 这里假设你有：
import { buildTabProgressHTML } from './tabs/progress.js';
import { buildTabWordsHTML } from './tabs/words.js';

let overlayEl = null;
let cardEl = null;

// 我们的激活页，默认是 "progress"（掌握进度）
let activeTab = 'progress';

// =====================================================
// 生成顶部 header + tab 按钮 + 内容
// =====================================================
function renderOverlayInnerHTML(){
    const snap = getTodaySnapshot();
    const roundVal = getRound(); // 一定是 1/2/3

    // 头部区域
    const headerHTML = `
        <div style="padding:16px 16px 8px 16px; position:relative;">
            <button id="ebb_close_btn" style="
                position:absolute;
                top:16px;
                right:16px;
                background:rgba(0,0,0,0.4);
                border:1px solid rgba(255,255,255,0.4);
                color:#fff;
                border-radius:12px;
                font-size:16px;
                line-height:1;
                padding:6px 10px;
            ">✕</button>

            <div style="color:#fff; line-height:1.4;">
                <div style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    font-size:18px;
                    font-weight:600;
                ">
                    <span style="font-size:18px;">🎓</span>
                    <span>艾宾浩斯词汇导师</span>
                </div>
                <div style="font-size:14px;color:#ccc;margin-top:4px;">
                    第 ${snap.currentDay} 天 ・ Round ${roundVal} / 3
                </div>
            </div>
        </div>
    `;

    // 四个大按钮（tab 切换）
    function tabBtn(id, label, isActive){
        return `
        <button
            id="${id}"
            style="
                flex:1;
                min-width:70px;
                background:${isActive ? 'rgb(15,100,25)' : 'rgba(0,0,0,0.4)'};
                border:1px solid ${isActive ? 'rgb(80,200,100)' : 'rgba(255,255,255,0.4)'};
                color:#fff;
                border-radius:10px;
                padding:12px 10px;
                font-size:20px;
                line-height:1.4;
                font-weight:${isActive ? '600' : '400'};
                text-align:center;
            "
        >${label}</button>`;
    }

    const tabsHTML = `
        <div style="
            display:flex;
            gap:12px;
            padding:0 16px;
            margin-top:12px;   /* 这里就是把按钮区往下“拉开”一点 */
            flex-wrap:nowrap;
            overflow-x:auto;
            -webkit-overflow-scrolling:touch;
        ">
            ${tabBtn('ebb_tab_progress','掌握进度',   activeTab==='progress')}
            ${tabBtn('ebb_tab_words','单词清单',       activeTab==='words')}
            ${tabBtn('ebb_tab_plan','复习计划',        activeTab==='plan')}
            ${tabBtn('ebb_tab_round','学习轮次',       activeTab==='round')}
        </div>
    `;

    // 内容区：根据 activeTab 决定
    let bodyHTML = '';
    if(activeTab === 'progress'){
        bodyHTML = buildTabProgressHTML();
    }else if(activeTab === 'words'){
        bodyHTML = buildTabWordsHTML();
    }else if(activeTab === 'plan'){
        bodyHTML = buildTabScheduleHTML();
    }else if(activeTab === 'round'){
        bodyHTML = buildTabRoundHTML(); // 这个里会显示 Round X
    }

    // 包一层内容容器，留点内边距，滚动什么的由各自 tab 里处理
    const contentHTML = `
        <div id="ebb_tab_content" style="
            padding:16px;
            color:#fff;
            font-size:14px;
            line-height:1.5;
        ">
            ${bodyHTML}
        </div>
    `;

    return headerHTML + tabsHTML + contentHTML;
}

// =====================================================
// 重新渲染整张卡片 (含 header / tabs / content)
// =====================================================
function rerenderOverlayCard(){
    if(!cardEl) return;
    cardEl.innerHTML = renderOverlayInnerHTML();

    // 绑定关闭
    const closeBtn = cardEl.querySelector('#ebb_close_btn');
    if(closeBtn){
        closeBtn.addEventListener('click', (ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
            hideOverlay();
        }, true);
    }

    // 绑定 tab 切换
    const bindTab = (id,name)=>{
        const btn = cardEl.querySelector('#'+id);
        if(btn){
            btn.addEventListener('click', ()=>{
                activeTab = name;
                rerenderOverlayCard(); // 切一次 tab 重新渲
            });
        }
    };
    bindTab('ebb_tab_progress','progress');
    bindTab('ebb_tab_words','words');
    bindTab('ebb_tab_plan','plan');
    bindTab('ebb_tab_round','round');

    // 如果是“学习轮次”页，绑定它内部的按钮（下一轮 / 第几轮）
    if(activeTab === 'round'){
        const contentRoot = cardEl.querySelector('#ebb_tab_content');
        if(contentRoot){
            bindRoundTabEvents(contentRoot);
        }
    }
}

// =====================================================
// 对外：显示/隐藏
// =====================================================
export function showOverlay(){
    // 打开时，默认回到第一个tab“掌握进度”
    activeTab = 'progress';

    if(!overlayEl){
        overlayEl = document.createElement('div');
        overlayEl.id = 'ebb_overlay_root';
        overlayEl.style.position = 'fixed';
        overlayEl.style.left = '0';
        overlayEl.style.top = '0';
        overlayEl.style.width = '100vw';
        overlayEl.style.height = '100vh';
        overlayEl.style.background = 'rgba(0,0,0,0.5)';
        overlayEl.style.zIndex = '9999';
        overlayEl.style.display = 'flex';
        overlayEl.style.alignItems = 'center';
        overlayEl.style.justifyContent = 'center';
        overlayEl.style.padding = '20px';
        overlayEl.style.boxSizing = 'border-box';

        // 点击遮罩空白处关闭
        overlayEl.addEventListener('click',(ev)=>{
            if(ev.target === overlayEl){
                hideOverlay();
            }
        }, true);

        cardEl = document.createElement('div');
        cardEl.id = 'ebb_overlay_card';
        cardEl.style.background = 'rgba(20,20,20,0.95)';
        cardEl.style.borderRadius = '14px';
        cardEl.style.border = '1px solid rgba(255,255,255,0.25)';
        cardEl.style.color = '#fff';
        cardEl.style.width = '90%';
        cardEl.style.maxWidth = '460px';
        cardEl.style.maxHeight = '80vh';
        cardEl.style.overflow = 'hidden'; // 让内部自己滚
        cardEl.style.boxShadow = '0 20px 60px rgba(0,0,0,0.8)';

        overlayEl.appendChild(cardEl);
        document.body.appendChild(overlayEl);
    }

    rerenderOverlayCard();
    overlayEl.style.display = 'flex';
}

export function hideOverlay(){
    if(overlayEl){
        overlayEl.style.display = 'none';
    }
}
