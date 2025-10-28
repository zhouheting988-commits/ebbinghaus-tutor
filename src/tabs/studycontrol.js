// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/studycontrol.js
import { getRound } from '../data.js';

// 这个函数会在 overlay.js 里被调用，用来生成 "学习轮次" 这整个tab的HTML
export function buildTabStudyControlHTML() {
  // 当前是第几轮（1 / 2 / 3）
  const curr = getRound() ?? 1;

  // 小工具：生成一个按钮的HTML
  // roundNumber = 这个按钮代表的轮次（1/2/3），如果是“下一轮”这种就传 null
  // special     = 特殊动作，比如 'next'
  function makeBtn(label, roundNumber, special) {
    const isActive = (roundNumber === curr);
    const bg = isActive ? '#2e7d32' : 'rgba(255,255,255,0.08)';

    return `
      <button
        class="ebb-roundbtn"
        ${roundNumber ? `data-round="${roundNumber}"` : ''}
        ${special ? `data-act="${special}"` : ''}
        style="
          background:${bg};
          color:#fff;
          border:1px solid rgba(255,255,255,0.18);
          padding:12px 10px;
          border-radius:10px;
          text-align:center;
          min-width:110px;
          font-size:18px;
          line-height:1.4;
          cursor:pointer;
        "
      >${label}</button>
    `;
  }

  // 把所有需要的按钮做出来
  const btnNext   = makeBtn('下一轮 ↗', null, 'next');
  const btnRound1 = makeBtn('回到第1轮', 1, null);
  const btnRound2 = makeBtn('第2轮(短语)', 2, null);
  const btnRound3 = makeBtn('第3轮(句子)', 3, null);

  // 返回整块HTML
  return `
    <div style="font-size:16px;line-height:1.5;color:#fff;margin-bottom:12px;">
      学习轮次（词→短语→句子）。当前是 <b>Round ${curr}</b> ，可手动切换。
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      ${btnNext}
      ${btnRound1}
      ${btnRound2}
      ${btnRound3}
    </div>

    <div style="font-size:13px;line-height:1.4;color:rgba(255,255,255,0.6);">
      这里只记录轮次到 Study_Control.Current_Round;
    </div>
  `;
}
