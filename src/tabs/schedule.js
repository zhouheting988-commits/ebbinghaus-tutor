// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/schedule.js

import { data as getAllData } from '../data.js';

// 复习计划 Tab
// 展示：Day → 今天要背哪一组（NewList）
// 注：我们这里先只显示主线“今天新记忆哪组单词”这一列（也就是你的截图那种 Day / ListX）
//     如果以后你想一起展示 Review 的那些列表，也可以扩展。

export function buildTabScheduleHTML() {
  const fullData = getAllData(); // 整个 EbbData
  const scheduleMap = fullData.Ebbinghaus_Schedule || {};

  // 把 key(天数) 全拿出来，转成数字排序，保证是 1,2,3,...25
  const dayNums = Object.keys(scheduleMap)
    .map(n => parseInt(n, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  // 表头
  let rowsHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:12px 16px;
      background:rgba(255,255,255,0.08);
      color:#fff;
      font-size:18px;
      font-weight:600;
      line-height:1.4;
      border-bottom:1px solid rgba(255,255,255,0.2);
    ">
      <div style="min-width:4em;">Day</div>
      <div style="text-align:right;flex:1;">NewList</div>
    </div>
  `;

  // 每一行 Day / ListX
  rowsHTML += dayNums.map(dayNum => {
    const plan = scheduleMap[String(dayNum)] || {};
    const listName = plan.NewList || '(无)';

    return `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        padding:12px 16px;
        color:#fff;
        font-size:22px;
        line-height:1.4;
        border-bottom:1px solid rgba(255,255,255,0.15);
        background:transparent;
      ">
        <div style="min-width:4em;">${dayNum}</div>
        <div style="text-align:right;flex:1;">${listName}</div>
      </div>
    `;
  }).join('');

  // 最外层盒子：跟你现在的卡片风格一致，深灰+浅边框+圆角
  return `
    <div style="
      background:rgba(0,0,0,0.4);
      border:1px solid rgba(255,255,255,0.2);
      border-radius:12px;
      box-shadow:0 10px 30px rgba(0,0,0,0.6);
      color:#fff;
      overflow:hidden;
      font-family:inherit;
    ">
      ${rowsHTML}
    </div>
  `;
}
