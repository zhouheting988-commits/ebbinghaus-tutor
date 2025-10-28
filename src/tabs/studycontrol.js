// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/studycontrol.js

import { getRound } from '../data.js';

// 构建“学习轮次”这个 tab 的 HTML
export function buildTabStudyControlHTML() {
  const curr = getRound() ?? 1; // 当前第几轮 (1/2/3)

  // 统一的按钮样式生成器
  // roundNumber: 1/2/3，表示这个按钮对应哪一轮；如果是“下一轮 ↗”那类就传 null
  // special: 'next' 代表“下一轮 ↗”
  function makeBtn(label, roundNumber, special) {
    const isActive = (roundNumber === curr);

    const bgColor   = isActive ? '#2e7d32' : 'rgba(255,255,255,0.06)';
    const textColor = '#fff';
    const borderClr = 'rgba(255,255,255,0.28)';

    return `
      <button
        class="ebb-roundbtn"
        ${roundNumber ? `data-round="${roundNumber}"` : ''}
        ${special ? `data-act="${special}"` : ''}
        style="
          width:100%;
          background:${bgColor};
          color:${textColor};
          border:1px solid ${borderClr};
          border-radius:12px;
          padding:14px 16px;
          font-size:20px;
          line-height:1.4;
          text-align:center;
          font-weight:500;
          box-sizing:border-box;
        "
      >${label}</button>
    `;
  }

  // 四个操作按钮
  const btnNext   = makeBtn('下一轮 ↗', null, 'next');
  const btnR1     = makeBtn('回到第1轮', 1, null);
  const btnR2     = makeBtn('第2轮(短语)', 2, null);
  const btnR3     = makeBtn('第3轮(句子)', 3, null);

  // 整体布局：
  // 1. 上面是说明文字
  // 2. 中间是一列按钮，并且每个按钮之间有间距
  // 3. 下面是灰色小字说明
  return `
    <div style="
      font-size:16px;
      line-height:1.6;
      color:#fff;
      margin-bottom:16px;
    ">
      学习轮次（词→短语→句子）。当前是 <b>Round ${curr}</b> ，可手动切换。
    </div>

    <div style="
      display:flex;
      flex-direction:column;
      gap:12px;
      margin-bottom:20px;
    ">
      ${btnNext}
      ${btnR1}
      ${btnR2}
      ${btnR3}
    </div>

    <div style="
      font-size:13px;
      line-height:1.4;
      color:rgba(255,255,255,0.6);
      padding-bottom:8px;
    ">
      这里只记录轮次到 Study_Control.Current_Round;
    </div>
  `;
}
