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
  <div style="position:relative;">
    <!-- 右上角小型关闭钮 -->
    <button id="ebb-close"
      style="position:absolute;right:0;top:0;transform:translate(6px,-6px);
             background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);
             color:#fff;border-radius:10px;padding:4px 8px;font-size:12px;line-height:1;cursor:pointer;">
      关闭
    </button>

    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <!-- 左：图标+标题+副标题（全部一行不换行） -->
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        <span style="font-size:18px;line-height:18px;flex:0 0 auto;">🎓</span>
        <div style="display:flex;flex-direction:column;min-width:0;">
          <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                      font-size:16px;font-weight:700;line-height:1;">艾宾浩斯词汇导师</div>
          <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                      font-size:12px;opacity:.85;line-height:1.2;margin-top:4px;">
            第 ${snap.currentDay} 天　Round ${snap.round} / 3
          </div>
        </div>
      </div>

      <!-- 右：日期徽章 -->
      <div style="background:#d33;color:#fff;border-radius:10px;padding:6px 8px;
                  text-align:center;min-width:54px;flex:0 0 auto;">
        <div style="font-size:12px;">${m}月</div>
        <div style="font-size:16px;font-weight:700;">${d}</div>
      </div>
    </div>
  </div>
  `;
}

function render(active){
  cardEl.innerHTML = `
    ${headerHTML()}
    ${tabsHTML(active)}
  `;
  // 顶部右上角关闭
  const closeBtn = cardEl.querySelector('#ebb-close');
  if (closeBtn) closeBtn.addEventListener('click', hideOverlay, true);

  cardEl.querySelectorAll('.ebb-tabbtn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const key = e.currentTarget.getAttribute('data-tab');
      render(key);
    }, true);
  });
}
