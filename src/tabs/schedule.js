// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/schedule.js

import { getCurrentScheduleInfo } from '../data.js';

export function buildTabScheduleHTML() {
  const { plan, totalDays, label } = getCurrentScheduleInfo();

  // 按当前轮次的天数循环
  let rowsHTML = '';
  for (let day = 1; day <= totalDays; day++) {
    const todayPlan = plan[String(day)] || { NewList: '', Review: [] };
    const newList = todayPlan.NewList || '';

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

  return `
    <div style="
      font-size:16px;
      line-height:1.5;
      color:#fff;
      margin-bottom:12px;
    ">
      复习计划（${label}） · 可左右滑动查看复习列
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
        min-width:520px;
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
