// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/schedule.js
import { data } from '../data.js';

/**
 * 复习计划页（表三）
 * - 纵向滚动到 Day 25
 * - 横向可滑动（根据最大 Review 列数自动生成表头/单元格）
 * - 自动适配你给的固定计划（1~25天），不再只显示到 List5
 */
export function buildTabScheduleHTML() {
  const sch = (data() && data().Ebbinghaus_Schedule) || {};
  const dayKeys = Object.keys(sch);
  const days = dayKeys.map(Number).sort((a, b) => a - b);

  // 动态计算需要展示的最大 Review 列数（最多 5 列）
  let maxReviews = 0;
  for (const d of days) {
    const rlen = (sch[String(d)]?.Review ?? []).length;
    if (rlen > maxReviews) maxReviews = rlen;
  }
  if (maxReviews > 5) maxReviews = 5; // 保护：最多展示 5 列

  // 构造表头
  const th = (txt) =>
    `<th style="text-align:left;padding:8px 10px;color:#fff;white-space:nowrap;">${txt}</th>`;
  let theadCols = `${th('Day')}${th('NewList')}`;
  for (let i = 1; i <= maxReviews; i++) theadCols += th(`Review${i}`);

  // 构造数据行
  const td = (v) =>
    `<td style="padding:8px 10px;white-space:nowrap;color:#fff;">${v || '…'}</td>`;

  const rows = days
    .map((day) => {
      const conf = sch[String(day)] || { NewList: '', Review: [] };
      const reviewArr = conf.Review || [];
      let reviewCells = '';
      for (let i = 0; i < maxReviews; i++) {
        reviewCells += td(reviewArr[i] || '');
      }
      return `<tr>
        ${td(day)}
        ${td(conf.NewList || '')}
        ${reviewCells}
      </tr>`;
    })
    .join('');

  // 根据列数给一个合理的 min-width，避免列挤在一起
  const minWidth = 240 + (2 + maxReviews) * 140; // 简单估算：列越多表越宽

  return `
  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:10px;background:rgba(255,255,255,0.03);">
    <!-- 纵向滚动容器 -->
    <div style="
      height:56vh;
      overflow-y:auto;
      overscroll-behavior:contain;
      -webkit-overflow-scrolling:touch;
      border-radius:8px;
    ">
      <!-- 横向滚动容器 -->
      <div style="overflow-x:auto; -webkit-overflow-scrolling:touch;">
        <table style="border-collapse:collapse; min-width:${minWidth}px; width:100%;">
          <thead style="background:rgba(255,255,255,0.07); position:sticky; top:0; z-index:1;">
            <tr>${theadCols}</tr>
          </thead>
          <tbody>
            ${rows || '<tr><td style="padding:8px 10px;color:#fff;">（无计划数据）</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
