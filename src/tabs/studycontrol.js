// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/studycontrol.js
import { getRound, setRound, nextRound, getTodaySnapshot } from '../data.js';

export function buildTabStudyControlHTML(){
  const snap = getTodaySnapshot();
  const r = snap.round;

  const btn = (label,active,onclick)=>`
    <button data-act="${onclick}" style="
      background:${active?'#2e7d32':'rgba(255,255,255,0.08)'};color:#fff;
      border:1px solid rgba(255,255,255,0.18);padding:8px 10px;border-radius:10px;cursor:pointer;">${label}</button>`;

  const html = `
  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:12px;">
    <div style="color:#ddd;margin-bottom:10px;">学习轮次（词→短语→句子）。当前是 <b>Round ${r}</b>，可手动切换。</div>
    <div style="display:flex;gap:10px;margin-bottom:12px;">
      ${btn('下一轮 ↗', false, 'next')}
      ${btn('回到第1轮', r===1, 'r1')}
      ${btn('第2轮(短语)', r===2, 'r2')}
      ${btn('第3轮(句子)', r===3, 'r3')}
    </div>
    <div style="color:#aaa;font-size:13px;">
      这里只记录轮次到 Study_Control.Current_Round；真正出题时，让“教官”读取这个值决定考察形式。
    </div>
  </div>
  `;

  // 绑定事件由 overlay 调用后统一委托（这里返回 html 即可）
  setTimeout(()=>{
    document.querySelectorAll('[data-act]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const act = btn.getAttribute('data-act');
        if(act==='next') nextRound();
        if(act==='r1') setRound(1);
        if(act==='r2') setRound(2);
        if(act==='r3') setRound(3);
        // 重新渲染 overlay 当前页
        const evt = new CustomEvent('ebb-refresh', { detail:{tab:'control'}});
        document.dispatchEvent(evt);
      }, { once:true });
    });
    // overlay 里会监听 ebb-refresh 并重新 render；这里发出事件即可
  }, 0);

  return html;
}
