// scripts/extensions/third-party/EbbinghausTrainer/src/overlay.js
import { getTodaySnapshot } from './data.js';
import { buildTabVocabularyHTML } from './tabs/vocabulary.js';
import { buildTabWordListsHTML }  from './tabs/wordlists.js';
import { buildTabScheduleHTML }   from './tabs/schedule.js';
import { buildTabStudyControlHTML } from './tabs/studycontrol.js';

let overlayEl=null, cardEl=null;

function headerHTML(){
  const now = new Date();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const snap = getTodaySnapshot();

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;white-space:nowrap;">
    <div style="display:flex;align-items:center;gap:10px;white-space:nowrap;">
      <span style="font-size:18px;line-height:1;">🎓</span>
      <div style="display:flex;flex-direction:column;gap:2px;white-space:nowrap;">
        <div style="font-size:16px;font-weight:700;line-height:1;white-space:nowrap;">艾宾浩斯词汇导师</div>
        <div style="font-size:12px;opacity:.85;line-height:1;white-space:nowrap;">
          第 ${snap.currentDay} 天 · Round ${snap.round} / 3
        </div>
      </div>
    </div>
    <div style="background:#d33;color:#fff;border-radius:10px;padding:6px 8px;text-align:center;min-width:54px;">
      <div style="font-size:11px;line-height:1;">${m}月</div>
      <div style="font-size:15px;font-weight:700;line-height:1;">${d}</div>
    </div>
  </div>`;
}

function tabsHTML(active='schedule'){
  const tabs = [
    {key:'vocab',    name:'掌握进度'},
    {key:'lists',    name:'单词清单'},
    {key:'schedule', name:'复习计划'},
    {key:'control',  name:'学习轮次'},
  ];
  const btns = tabs.map(t=>{
    const on = t.key===active;
    return `<button data-tab="${t.key}" class="ebb-tabbtn" style="
      background:${on?'#2e7d32':'rgba(255,255,255,0.08)'};color:#fff;border:1px solid rgba(255,255,255,0.18);
      padding:8px 10px;border-radius:10px;cursor:pointer;">${t.name}</button>`;
  }).join('<span style="width:10px;"></span>');

  let content = '';
  if(active==='vocab')    content = buildTabVocabularyHTML();
  if(active==='lists')    content = buildTabWordListsHTML();
  if(active==='schedule') content = buildTabScheduleHTML();
  if(active==='control')  content = buildTabStudyControlHTML();

  return `
    <div style="display:flex;gap:10px;margin-bottom:10px;">${btns}</div>
    <div id="ebb-tab-content">${content}</div>
  `;
}

export function showOverlay(active='schedule'){
  if(!overlayEl){
    overlayEl = document.createElement('div');
    Object.assign(overlayEl.style,{
      position:'fixed',left:0,top:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.4)',
      zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',boxSizing:'border-box'
    });
    overlayEl.addEventListener('click', e=>{ if(e.target===overlayEl) hideOverlay(); }, true);

    cardEl = document.createElement('div');
    Object.assign(cardEl.style,{
      position:'relative',                 // ← 新增
      background:'rgba(20,20,20,0.95)',color:'#fff',
      border:'1px solid rgba(255,255,255,0.2)',
      borderRadius:'12px',padding:'16px',
      width:'90%',maxWidth:'520px',maxHeight:'80vh',
      overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.8)'
    });
    overlayEl.appendChild(cardEl);
    document.body.appendChild(overlayEl);
  }
  render(active);
  overlayEl.style.display='flex';
}

export function hideOverlay(){ if(overlayEl) overlayEl.style.display='none'; }

function render(active){
  cardEl.innerHTML = `
    ${headerHTML()}
    ${tabsHTML(active)}
    <button id="ebb-close" aria-label="关闭" style="
      position:absolute;right:10px;top:10px;
      width:26px;height:26px;border-radius:50%;
      background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.25);
      font-size:16px;line-height:24px;text-align:center;cursor:pointer;">×</button>
  `;
  cardEl.querySelector('#ebb-close').addEventListener('click', hideOverlay, true);
  cardEl.querySelectorAll('.ebb-tabbtn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const key = e.currentTarget.getAttribute('data-tab');
      render(key);
    }, true);
  });
}
