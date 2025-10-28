// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/schedule.js

import { data } from '../data.js';

// 构建 “复习计划” 这一页的 HTML
export function buildTabScheduleHTML() {
  const db = data(); // 当前内存里的整包数据
  const plan = db.Ebbinghaus_Schedule || {};

  const TOTAL_DAYS = 25; // 我们清楚表应该到 Day 25

  // 逐行构建表格 <tr>...</tr>
  let rowsHTML = '';
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    // 从数据里拿今天的安排
    const todayPlan = plan[String(day)] || { NewList: '', Review: [] };
    const newList = todayPlan.NewList || '';

    // Review 是一个数组，比如 ["List1","List3","List4"]
    // 我们最多显示到复习5列，不够的地方就留空
    const rv = todayPlan.Review || [];
    const r1 = rv[0] || '';
    const r2 = rv[1] || '';
    const r3 = rv[2] || '';
    const r4 = rv[3] || '';
    const r5 = rv[4] || '';

    rowsHTML += `
      <tr>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);white-space:nowrap;">Day ${day}</td>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);">${newList}</td>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);">${r1}</td>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);">${r2}</td>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);">${r3}</td>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);">${r4}</td>
        <td style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.15);">${r5}</td>
      </tr>
    `;
  }

  // 整个tab的HTML
  // 结构说明：
  // 1. 上面一小段说明文字
  // 2. 外层div: overflow-x:auto 允许左右滑动
  // 3. table: 把“Day / 记忆 / 复习1 ... 复习5”都列出来
  return `
    <div style="
      font-size:16px;
      line-height:1.5;
      color:#fff;
      margin-bottom:12px;
    ">
      复习计划表（可左右滑动查看复习列）。
    </div>

    <div style="
      overflow-x:auto;
      border:1px solid rgba(255,255,255,0.25);
      border-radius:12px;
      background:rgba(0,0,0,0.3);
      box-shadow:0 8px 24px rgba(0,0,0,0.6);
    ">
      <table style="
        border-collapse:collapse;
        min-width:520px; /* 比屏幕略宽，手机上就可以横向滑 */
        color:#fff;
        font-size:18px;
        line-height:1.4;
        width:100%;
      ">
        <thead>
          <tr style="background:rgba(255,255,255,0.05);">
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">Day</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">记忆</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">复习1</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">复习2</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">复习3</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">复习4</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.3);white-space:nowrap;">复习5</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>
  `;
}
